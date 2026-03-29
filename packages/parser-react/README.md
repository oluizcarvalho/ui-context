# @ui-context/parser-react

React component parser for [ui-context](https://github.com/oluizcarvalho/ui-context). Extracts component metadata from React source files using [react-docgen](https://github.com/reactjs/react-docgen).

## Installation

```bash
npm install @ui-context/parser-react
```

## Usage

```typescript
import { createParser } from "@ui-context/parser-react";

const parser = createParser();
const components = await parser.parse({
  sourcePath: "./src/components",
  include: ["**/*.tsx"],
  exclude: ["**/*.test.*"],
});
```

## What it extracts

- **Props** from TypeScript interfaces, Flow types, and PropTypes
- **Events** — Props starting with `on` + uppercase letter (e.g. `onClick`)
- **Examples** from `.stories.tsx` files and `@example` JSDoc tags
- **Component metadata** — name, description, display name

## Supported file types

`.tsx`, `.jsx`, `.ts`, `.js`

## Default ignore patterns

`**/*.test.*`, `**/*.spec.*`, `**/*.stories.*`

## Links

- [Documentation](https://oluizcarvalho.github.io/ui-context/)
- [GitHub](https://github.com/oluizcarvalho/ui-context/tree/main/packages/parser-react)
- [All packages](https://www.npmjs.com/org/ui-context)

## License

MIT
