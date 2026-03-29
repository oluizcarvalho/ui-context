# @ui-context/parser-angular

Angular component parser for [ui-context](https://github.com/oluizcarvalho/ui-context). Extracts component metadata from Angular source files using [ts-morph](https://github.com/dsherret/ts-morph).

## Installation

```bash
npm install @ui-context/parser-angular
```

## Usage

```typescript
import { createParser } from "@ui-context/parser-angular";

const parser = createParser();
const components = await parser.parse({
  sourcePath: "./src/components",
});
```

## What it extracts

- **Inputs** from `@Input()` decorators and Angular 14+ `input()` signal API
- **Outputs** from `@Output()` decorators and `output()` signal API
- **Public methods** (excluding lifecycle hooks and private methods)
- **Slots** from `<ng-content>` in component templates
- **Examples** from `.stories.ts` files and spec templates
- **Component metadata** — name, selector, description

## Supported decorators

`@Component`, `@Directive`, `@Input`, `@Output`

## Default ignore patterns

`**/*.spec.ts`, `**/*.module.ts`, `**/*.routing.ts`

## Links

- [Documentation](https://oluizcarvalho.github.io/ui-context/)
- [GitHub](https://github.com/oluizcarvalho/ui-context/tree/main/packages/parser-angular)
- [All packages](https://www.npmjs.com/org/ui-context)

## License

MIT
