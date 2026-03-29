import { glob } from "glob";
import * as fs from "node:fs";
import * as path from "node:path";
import type {
  ComponentParser,
  ParserOptions,
  ComponentMetadata,
  PropMetadata,
  EventMetadata,
  MethodMetadata,
  ExampleMetadata,
} from "@ui-context/core";

async function loadReactDocgen() {
  const mod = await import("react-docgen");
  return { parse: mod.parse, builtinResolvers: mod.builtinResolvers };
}

interface ReactDocgenProp {
  type?: { name: string; raw?: string; value?: Array<{ value: string }> };
  tsType?: { name: string; raw?: string };
  flowType?: { name: string; raw?: string };
  required?: boolean;
  defaultValue?: { value: string };
  description?: string;
}

interface ReactDocgenMethod {
  name: string;
  docblock?: string;
  params: Array<{ name: string; type?: { name: string } }>;
  returns?: { type?: { name: string } };
}

interface ReactDocgenResult {
  displayName?: string;
  description?: string;
  props?: Record<string, ReactDocgenProp>;
  methods?: ReactDocgenMethod[];
}

export class ReactParser implements ComponentParser {
  name = "react";
  supportedExtensions = [".tsx", ".jsx", ".ts", ".js"];

  async parse(options: ParserOptions): Promise<ComponentMetadata[]> {
    const { sourcePath, include, exclude } = options;
    const patterns = include ?? ["**/*.tsx", "**/*.jsx"];
    const ignorePatterns = exclude ?? [
      "**/*.test.*",
      "**/*.spec.*",
      "**/*.stories.*",
      "**/node_modules/**",
      "**/__tests__/**",
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: sourcePath,
        absolute: true,
        ignore: ignorePatterns,
      });
      files.push(...matches);
    }

    const components: ComponentMetadata[] = [];
    const { parse, builtinResolvers } = await loadReactDocgen();

    for (const filePath of files) {
      const source = fs.readFileSync(filePath, "utf-8");
      try {
        const docs = parse(source, {
          resolver: new builtinResolvers.FindAllDefinitionsResolver(),
          filename: filePath,
        }) as ReactDocgenResult[];

        for (const doc of docs) {
          const component = this.mapToMetadata(doc, filePath, sourcePath);
          if (component) {
            // Try to find examples from sibling .stories file
            const examples = await this.findExamples(filePath, sourcePath);
            component.examples = examples;
            components.push(component);
          }
        }
      } catch {
        // File doesn't contain parseable React components — skip
      }
    }

    return components;
  }

  private mapToMetadata(
    doc: ReactDocgenResult,
    filePath: string,
    sourcePath: string,
  ): ComponentMetadata | null {
    const name = doc.displayName;
    if (!name) return null;

    const props: PropMetadata[] = [];
    const events: EventMetadata[] = [];

    if (doc.props) {
      for (const [propName, propDef] of Object.entries(doc.props)) {
        const propType = this.resolveType(propDef);

        // Heuristic: props starting with "on" + uppercase are events
        if (
          propName.length > 2 &&
          propName.startsWith("on") &&
          propName[2] === propName[2].toUpperCase() &&
          propType.includes("=>") // callback signature
        ) {
          events.push({
            name: propName,
            payloadType: propType,
            description: propDef.description ?? "",
          });
        } else {
          props.push({
            name: propName,
            type: propType,
            required: propDef.required ?? false,
            defaultValue: propDef.defaultValue?.value,
            description: propDef.description ?? "",
          });
        }
      }
    }

    const methods: MethodMetadata[] = (doc.methods ?? [])
      .filter((m) => !m.name.startsWith("_"))
      .map((m) => ({
        name: m.name,
        signature: this.buildMethodSignature(m),
        description: m.docblock ?? "",
      }));

    return {
      name,
      description: doc.description ?? "",
      props,
      events,
      methods,
      slots: [],
      examples: [],
      sourceFile: path.relative(sourcePath, filePath),
      framework: "react",
    };
  }

  private resolveType(prop: ReactDocgenProp): string {
    if (prop.tsType) {
      return prop.tsType.raw ?? prop.tsType.name;
    }
    if (prop.flowType) {
      return prop.flowType.raw ?? prop.flowType.name;
    }
    if (prop.type) {
      if (prop.type.name === "enum" && prop.type.value) {
        return prop.type.value.map((v) => v.value).join(" | ");
      }
      return prop.type.raw ?? prop.type.name;
    }
    return "unknown";
  }

  private buildMethodSignature(method: ReactDocgenMethod): string {
    const params = method.params
      .map((p) => (p.type ? `${p.name}: ${p.type.name}` : p.name))
      .join(", ");
    const returnType = method.returns?.type?.name ?? "void";
    return `${method.name}(${params}): ${returnType}`;
  }

  private async findExamples(
    componentFile: string,
    sourcePath: string,
  ): Promise<ExampleMetadata[]> {
    const examples: ExampleMetadata[] = [];
    const baseName = path.basename(componentFile, path.extname(componentFile));
    const dir = path.dirname(componentFile);

    // Look for .stories.tsx/.stories.jsx files
    const storyExtensions = [".stories.tsx", ".stories.jsx", ".stories.ts", ".stories.js"];
    for (const ext of storyExtensions) {
      const storyFile = path.join(dir, `${baseName}${ext}`);
      if (fs.existsSync(storyFile)) {
        const content = fs.readFileSync(storyFile, "utf-8");
        examples.push({
          title: `${baseName} Storybook`,
          code: content,
          language: ext.endsWith(".tsx") || ext.endsWith(".ts") ? "tsx" : "jsx",
        });
        break;
      }
    }

    // Look for JSDoc @example tags in the component file
    const source = fs.readFileSync(componentFile, "utf-8");
    const exampleRegex = /@example\s*\n\s*\*?\s*```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = exampleRegex.exec(source)) !== null) {
      examples.push({
        title: `${baseName} example`,
        code: match[2].trim(),
        language: match[1] ?? "tsx",
      });
    }

    return examples;
  }
}

/** Factory function for parser discovery */
export function createParser(): ReactParser {
  return new ReactParser();
}
