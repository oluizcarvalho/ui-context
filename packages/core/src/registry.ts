import type { ComponentParser } from "./parser.js";

/**
 * Registry for component parsers.
 * Parsers can be registered manually or discovered from installed packages.
 */
export class ParserRegistry {
  private parsers = new Map<string, ComponentParser>();

  /** Register a parser instance */
  register(parser: ComponentParser): void {
    this.parsers.set(parser.name, parser);
  }

  /** Get a parser by name */
  get(name: string): ComponentParser | undefined {
    return this.parsers.get(name);
  }

  /** Get all registered parser names */
  list(): string[] {
    return Array.from(this.parsers.keys());
  }

  /** Check if a parser is registered */
  has(name: string): boolean {
    return this.parsers.has(name);
  }

  /**
   * Try to auto-discover and load a parser from an installed npm package.
   * Convention: @ui-context/parser-{name} should export a `createParser()` function.
   */
  async discover(name: string): Promise<ComponentParser | undefined> {
    const packageName = `@ui-context/parser-${name}`;
    try {
      const mod = await import(packageName);
      const parser: ComponentParser = mod.createParser
        ? mod.createParser()
        : mod.default;
      if (parser) {
        this.register(parser);
        return parser;
      }
    } catch {
      // Package not installed or doesn't export expected interface
    }
    return undefined;
  }

  /**
   * Get a parser by name, attempting auto-discovery if not already registered.
   */
  async resolve(name: string): Promise<ComponentParser | undefined> {
    return this.get(name) ?? (await this.discover(name));
  }
}
