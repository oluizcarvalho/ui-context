# @ui-context/core

Universal component schema and parser interface for [ui-context](https://github.com/oluizcarvalho/ui-context).

## Overview

This package provides the foundational types and interfaces used by all other `@ui-context` packages:

- **Component Schema** — Framework-agnostic metadata types (props, events, methods, slots, design tokens)
- **Parser Interface** — Contract that all framework parsers implement
- **Parser Registry** — Plugin system for registering and discovering parsers

## Installation

```bash
npm install @ui-context/core
```

## Usage

```typescript
import { ParserRegistry } from "@ui-context/core";
import type {
  ComponentMetadata,
  PropMetadata,
  EventMetadata,
  LibraryMetadata,
} from "@ui-context/core";

// Use the registry to manage parsers
const registry = new ParserRegistry();
registry.register(myParser);

const parser = await registry.resolve("react");
const components = await parser.parse({ sourcePath: "./src" });
```

## Schema Types

| Type | Description |
|------|-------------|
| `ComponentMetadata` | Full component definition (name, props, events, methods, slots, examples) |
| `PropMetadata` | Component input/property |
| `EventMetadata` | Component output/callback |
| `MethodMetadata` | Public method |
| `SlotMetadata` | Content projection slot |
| `ExampleMetadata` | Usage example |
| `DesignToken` | Design token (color, spacing, typography) |
| `LibraryMetadata` | Collection of components + tokens |

## Links

- [Documentation](https://oluizcarvalho.github.io/ui-context/)
- [GitHub](https://github.com/oluizcarvalho/ui-context)
- [All packages](https://www.npmjs.com/org/ui-context)

## License

MIT
