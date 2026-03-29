import type { ComponentMetadata } from "./schema.js";

/**
 * Options passed to a parser for component extraction.
 */
export interface ParserOptions {
  /** Path to the component library source directory */
  sourcePath: string;
  /** Glob patterns to include (e.g. ["**​/*.tsx"]) */
  include?: string[];
  /** Glob patterns to exclude (e.g. ["**​/*.test.*"]) */
  exclude?: string[];
}

/**
 * Interface that all framework-specific parsers must implement.
 * To add support for a new framework, create a package that exports
 * a class implementing this interface.
 */
export interface ComponentParser {
  /** Parser identifier, e.g. "angular", "react" */
  name: string;
  /** File extensions this parser can handle */
  supportedExtensions: string[];
  /** Parse source files and return extracted component metadata */
  parse(options: ParserOptions): Promise<ComponentMetadata[]>;
}
