import { Project, SyntaxKind, type ClassDeclaration, type PropertyDeclaration, type MethodDeclaration, type Decorator } from "ts-morph";
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
  SlotMetadata,
  ExampleMetadata,
} from "@ui-context/core";

export class AngularParser implements ComponentParser {
  name = "angular";
  supportedExtensions = [".ts"];

  async parse(options: ParserOptions): Promise<ComponentMetadata[]> {
    const { sourcePath, include, exclude } = options;
    const patterns = include ?? ["**/*.component.ts", "**/*.ts"];
    const ignorePatterns = exclude ?? [
      "**/*.spec.ts",
      "**/*.test.ts",
      "**/*.stories.ts",
      "**/node_modules/**",
      "**/__tests__/**",
      "**/*.module.ts",
      "**/*.routing.ts",
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

    const project = new Project({
      compilerOptions: {
        experimentalDecorators: true,
        strict: false,
        skipLibCheck: true,
      },
      skipAddingFilesFromTsConfig: true,
    });

    for (const file of files) {
      project.addSourceFileAtPath(file);
    }

    const components: ComponentMetadata[] = [];

    for (const sourceFile of project.getSourceFiles()) {
      const classes = sourceFile.getClasses();
      for (const cls of classes) {
        const componentDecorator = this.getDecorator(cls, "Component");
        if (!componentDecorator) continue;

        const metadata = this.extractComponent(cls, componentDecorator, sourceFile.getFilePath(), sourcePath);
        if (metadata) {
          metadata.examples = await this.findExamples(sourceFile.getFilePath(), sourcePath);
          components.push(metadata);
        }
      }
    }

    return components;
  }

  private getDecorator(cls: ClassDeclaration, name: string): Decorator | undefined {
    return cls.getDecorators().find((d) => d.getName() === name);
  }

  private extractComponent(
    cls: ClassDeclaration,
    decorator: Decorator,
    filePath: string,
    sourcePath: string,
  ): ComponentMetadata | null {
    const name = cls.getName();
    if (!name) return null;

    const selector = this.extractDecoratorProperty(decorator, "selector");
    const description = this.getJsDocDescription(cls);

    const props = this.extractInputs(cls);
    const events = this.extractOutputs(cls);
    const methods = this.extractPublicMethods(cls);
    const slots = this.extractSlots(decorator);

    return {
      name,
      selector: selector ?? undefined,
      description,
      props,
      events,
      methods,
      slots,
      examples: [],
      sourceFile: path.relative(sourcePath, filePath),
      framework: "angular",
    };
  }

  private extractDecoratorProperty(decorator: Decorator, property: string): string | null {
    const args = decorator.getArguments();
    if (args.length === 0) return null;

    const objLiteral = args[0];
    if (objLiteral.getKind() !== SyntaxKind.ObjectLiteralExpression) return null;

    const obj = objLiteral.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!obj) return null;

    const prop = obj.getProperty(property);
    if (!prop) return null;

    const init = prop.asKind(SyntaxKind.PropertyAssignment)?.getInitializer();
    if (!init) return null;

    const text = init.getText();
    // Remove surrounding quotes
    return text.replace(/^['"`]|['"`]$/g, "");
  }

  private extractInputs(cls: ClassDeclaration): PropMetadata[] {
    const props: PropMetadata[] = [];

    for (const property of cls.getProperties()) {
      const inputDecorator = property.getDecorators().find((d) => d.getName() === "Input");
      if (!inputDecorator) continue;

      const name = this.getInputAlias(inputDecorator) ?? property.getName();
      const type = property.getType().getText(property) ?? "any";
      const initializer = property.getInitializer();
      const required = !property.hasQuestionToken() && !initializer;
      const defaultValue = initializer?.getText();
      const description = this.getJsDocDescription(property);

      props.push({ name, type, required, defaultValue, description });
    }

    // Also check for signal-based inputs: input(), input.required()
    for (const property of cls.getProperties()) {
      const init = property.getInitializer();
      if (!init) continue;
      const text = init.getText();
      if (text.startsWith("input(") || text.startsWith("input.required(")) {
        const name = property.getName();
        const isRequired = text.startsWith("input.required(");
        const type = property.getType().getText(property) ?? "any";
        const description = this.getJsDocDescription(property);
        props.push({ name, type, required: isRequired, description });
      }
    }

    return props;
  }

  private getInputAlias(decorator: Decorator): string | null {
    const args = decorator.getArguments();
    if (args.length === 0) return null;
    const first = args[0];
    if (first.getKind() === SyntaxKind.StringLiteral) {
      return first.getText().replace(/^['"`]|['"`]$/g, "");
    }
    return null;
  }

  private extractOutputs(cls: ClassDeclaration): EventMetadata[] {
    const events: EventMetadata[] = [];

    for (const property of cls.getProperties()) {
      const outputDecorator = property.getDecorators().find((d) => d.getName() === "Output");
      if (!outputDecorator) continue;

      const name = property.getName();
      const typeText = property.getType().getText(property);
      // Extract generic type from EventEmitter<T>
      const payloadMatch = typeText.match(/EventEmitter<(.+)>/);
      const payloadType = payloadMatch ? payloadMatch[1] : undefined;
      const description = this.getJsDocDescription(property);

      events.push({ name, payloadType, description });
    }

    // Also check for signal-based outputs: output()
    for (const property of cls.getProperties()) {
      const init = property.getInitializer();
      if (!init) continue;
      const text = init.getText();
      if (text.startsWith("output(") || text.startsWith("output<")) {
        const name = property.getName();
        const type = property.getType().getText(property) ?? "any";
        const description = this.getJsDocDescription(property);
        events.push({ name, payloadType: type, description });
      }
    }

    return events;
  }

  private extractPublicMethods(cls: ClassDeclaration): MethodMetadata[] {
    return cls
      .getMethods()
      .filter((m) => {
        const name = m.getName();
        // Skip Angular lifecycle hooks and private/protected methods
        const isLifecycle = [
          "ngOnInit", "ngOnDestroy", "ngOnChanges", "ngAfterViewInit",
          "ngAfterContentInit", "ngDoCheck", "ngAfterViewChecked",
          "ngAfterContentChecked",
        ].includes(name);
        const isPrivate = m.hasModifier(SyntaxKind.PrivateKeyword) || name.startsWith("_");
        const isProtected = m.hasModifier(SyntaxKind.ProtectedKeyword);
        return !isLifecycle && !isPrivate && !isProtected;
      })
      .map((m) => ({
        name: m.getName(),
        signature: this.buildMethodSignature(m),
        description: this.getJsDocDescription(m),
      }));
  }

  private buildMethodSignature(method: MethodDeclaration): string {
    const params = method
      .getParameters()
      .map((p) => {
        const name = p.getName();
        const type = p.getType().getText(p);
        const optional = p.isOptional() ? "?" : "";
        return `${name}${optional}: ${type}`;
      })
      .join(", ");
    const returnType = method.getReturnType().getText(method);
    return `${method.getName()}(${params}): ${returnType}`;
  }

  private extractSlots(decorator: Decorator): SlotMetadata[] {
    const template = this.extractDecoratorProperty(decorator, "template");
    if (!template) return [];

    const slots: SlotMetadata[] = [];
    const ngContentRegex = /<ng-content\s*(?:select="([^"]*)")?\s*\/?>/g;
    let match;
    while ((match = ngContentRegex.exec(template)) !== null) {
      slots.push({
        name: match[1] ?? "default",
        description: match[1] ? `Content projected into ${match[1]}` : "Default content projection slot",
      });
    }
    return slots;
  }

  private getJsDocDescription(node: ClassDeclaration | PropertyDeclaration | MethodDeclaration): string {
    const jsDocs = node.getJsDocs();
    if (jsDocs.length === 0) return "";
    return jsDocs[0].getDescription().trim();
  }

  private async findExamples(
    componentFile: string,
    sourcePath: string,
  ): Promise<ExampleMetadata[]> {
    const examples: ExampleMetadata[] = [];
    const baseName = path.basename(componentFile, path.extname(componentFile));
    const dir = path.dirname(componentFile);

    // Look for .stories.ts files
    const storyFile = path.join(dir, `${baseName.replace(".component", "")}.stories.ts`);
    if (fs.existsSync(storyFile)) {
      const content = fs.readFileSync(storyFile, "utf-8");
      examples.push({
        title: `${baseName} Storybook`,
        code: content,
        language: "angular",
      });
    }

    // Look for usage in spec files
    const specFile = path.join(dir, `${baseName}.spec.ts`);
    if (fs.existsSync(specFile)) {
      const content = fs.readFileSync(specFile, "utf-8");
      // Extract template strings from TestBed configurations
      const templateRegex = /template:\s*`([^`]+)`/g;
      let match;
      while ((match = templateRegex.exec(content)) !== null) {
        examples.push({
          title: `${baseName} test usage`,
          code: match[1].trim(),
          language: "html",
        });
      }
    }

    return examples;
  }
}

/** Factory function for parser discovery */
export function createParser(): AngularParser {
  return new AngularParser();
}
