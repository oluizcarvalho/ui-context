import * as fs from "node:fs";
import * as path from "node:path";
import type { Command } from "commander";
import { ParserRegistry, type LibraryMetadata } from "@ui-context/core";
import { createParser as createReactParser } from "@ui-context/parser-react";
import { createParser as createAngularParser } from "@ui-context/parser-angular";

export function registerGenerateCommand(program: Command): void {
  program
    .command("generate")
    .description("Extract component metadata and generate MCP server configuration")
    .requiredOption("-s, --source <path>", "Path to the component library source directory")
    .requiredOption("-p, --parser <name>", "Parser to use (angular, react)")
    .option("-o, --output <path>", "Output directory", "./ui-context-output")
    .option("--name <name>", "Library name (defaults to directory name)")
    .option("--include <patterns...>", "Glob patterns to include")
    .option("--exclude <patterns...>", "Glob patterns to exclude")
    .action(async (opts) => {
      const { default: chalk } = await import("chalk");
      const { default: ora } = await import("ora");

      const sourcePath = path.resolve(opts.source);
      const outputPath = path.resolve(opts.output);
      const libraryName = opts.name ?? path.basename(sourcePath);

      // Validate source exists
      if (!fs.existsSync(sourcePath)) {
        console.error(chalk.red(`Source path does not exist: ${sourcePath}`));
        process.exit(1);
      }

      // Register parsers
      const registry = new ParserRegistry();
      registry.register(createReactParser());
      registry.register(createAngularParser());

      const parser = registry.get(opts.parser);
      if (!parser) {
        console.error(
          chalk.red(`Unknown parser: "${opts.parser}". Available: ${registry.list().join(", ")}`),
        );
        process.exit(1);
        return;
      }

      const spinner = ora(`Parsing components with ${parser.name} parser...`).start();

      try {
        const components = await parser.parse({
          sourcePath,
          include: opts.include,
          exclude: opts.exclude,
        });

        spinner.succeed(`Found ${components.length} components`);

        if (components.length === 0) {
          console.warn(chalk.yellow("No components found. Check your source path and parser selection."));
          return;
        }

        // Build library metadata
        const metadata: LibraryMetadata = {
          name: libraryName,
          framework: parser.name,
          components,
        };

        // Create output directory
        fs.mkdirSync(outputPath, { recursive: true });

        // Write metadata JSON
        const metadataPath = path.join(outputPath, "components.json");
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(chalk.green(`  ✓ Metadata written to ${metadataPath}`));

        // Write MCP server config snippet
        const mcpServerEntry = require.resolve("@ui-context/mcp-server");
        const configSnippet = {
          mcpServers: {
            [libraryName]: {
              command: "node",
              args: [mcpServerEntry, metadataPath],
            },
          },
        };

        const configPath = path.join(outputPath, "mcp-config.json");
        fs.writeFileSync(configPath, JSON.stringify(configSnippet, null, 2));
        console.log(chalk.green(`  ✓ MCP config written to ${configPath}`));

        // Print usage instructions
        console.log("");
        console.log(chalk.bold("Next steps:"));
        console.log("");
        console.log(`  1. Start the MCP server:`);
        console.log(chalk.cyan(`     ui-context serve --data ${metadataPath}`));
        console.log("");
        console.log(`  2. Add to Claude CLI (Claude Code):`);
        console.log(chalk.cyan(`     claude mcp add ${libraryName} -- npx -y @ui-context/cli serve -d ${metadataPath}`));
        console.log("");
        console.log(`  3. Or add to Claude Desktop / Cursor (copy ${path.basename(configPath)}):`);
        console.log(chalk.cyan(`     ${configPath}`));
        console.log("");
        console.log(
          chalk.dim(
            `  Components: ${components.length} | Framework: ${parser.name} | Library: ${libraryName}`,
          ),
        );
      } catch (error) {
        spinner.fail("Failed to parse components");
        console.error(chalk.red(String(error)));
        process.exit(1);
      }
    });
}
