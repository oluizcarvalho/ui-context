import * as fs from "node:fs";
import * as path from "node:path";
import type { Command } from "commander";
import type { LibraryMetadata, ComponentMetadata } from "@ui-context/core";

interface ValidationIssue {
  component: string;
  field: string;
  severity: "error" | "warning";
  message: string;
}

function validateMetadata(metadata: LibraryMetadata): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!metadata.name) {
    issues.push({
      component: "(library)",
      field: "name",
      severity: "error",
      message: "Library name is missing",
    });
  }

  if (!metadata.components || metadata.components.length === 0) {
    issues.push({
      component: "(library)",
      field: "components",
      severity: "error",
      message: "No components found in metadata",
    });
    return issues;
  }

  for (const component of metadata.components) {
    validateComponent(component, issues);
  }

  return issues;
}

function validateComponent(component: ComponentMetadata, issues: ValidationIssue[]): void {
  const name = component.name || "(unnamed)";

  if (!component.name) {
    issues.push({
      component: name,
      field: "name",
      severity: "error",
      message: "Component name is missing",
    });
  }

  if (!component.description) {
    issues.push({
      component: name,
      field: "description",
      severity: "warning",
      message: "Component description is missing",
    });
  }

  for (const prop of component.props) {
    if (!prop.description) {
      issues.push({
        component: name,
        field: `props.${prop.name}`,
        severity: "warning",
        message: `Prop "${prop.name}" has no description`,
      });
    }
    if (prop.type === "any" || prop.type === "unknown") {
      issues.push({
        component: name,
        field: `props.${prop.name}`,
        severity: "warning",
        message: `Prop "${prop.name}" has untyped or unknown type`,
      });
    }
  }

  for (const event of component.events) {
    if (!event.description) {
      issues.push({
        component: name,
        field: `events.${event.name}`,
        severity: "warning",
        message: `Event "${event.name}" has no description`,
      });
    }
  }

  if (component.examples.length === 0) {
    issues.push({
      component: name,
      field: "examples",
      severity: "warning",
      message: "No usage examples found",
    });
  }
}

export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate extracted component metadata for completeness and quality")
    .requiredOption("-d, --data <path>", "Path to components.json metadata file")
    .action(async (opts) => {
      const { default: chalk } = await import("chalk");

      const dataPath = path.resolve(opts.data);

      if (!fs.existsSync(dataPath)) {
        console.error(chalk.red(`Metadata file not found: ${dataPath}`));
        process.exit(1);
      }

      let raw: string;
      try {
        raw = fs.readFileSync(dataPath, "utf-8");
      } catch {
        console.error(chalk.red(`Failed to read metadata file: ${dataPath}`));
        process.exit(1);
        return;
      }

      let metadata: LibraryMetadata;
      try {
        metadata = JSON.parse(raw);
      } catch {
        console.error(chalk.red(`Failed to parse metadata file as JSON: ${dataPath}`));
        process.exit(1);
        return;
      }

      const issues = validateMetadata(metadata);
      const errors = issues.filter((i) => i.severity === "error");
      const warnings = issues.filter((i) => i.severity === "warning");

      console.log(chalk.bold(`Validation results for "${metadata.name}":`));
      console.log(
        chalk.dim(
          `${metadata.components?.length ?? 0} components, ${metadata.components?.reduce((sum, c) => sum + c.props.length, 0) ?? 0} props`,
        ),
      );
      console.log("");

      if (errors.length > 0) {
        console.log(chalk.red(`✗ ${errors.length} error(s):`));
        for (const issue of errors) {
          console.log(chalk.red(`  [${issue.component}] ${issue.field}: ${issue.message}`));
        }
        console.log("");
      }

      if (warnings.length > 0) {
        console.log(chalk.yellow(`⚠ ${warnings.length} warning(s):`));
        for (const issue of warnings) {
          console.log(chalk.yellow(`  [${issue.component}] ${issue.field}: ${issue.message}`));
        }
        console.log("");
      }

      if (issues.length === 0) {
        console.log(chalk.green("✓ All checks passed! Metadata is complete."));
      }

      process.exit(errors.length > 0 ? 1 : 0);
    });
}
