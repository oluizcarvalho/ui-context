<p align="center">
  <h1 align="center">ui-context</h1>
  <p align="center">
    <strong>Generate MCP Servers from frontend component libraries</strong>
  </p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> &middot;
    <a href="#cli-commands">CLI Commands</a> &middot;
    <a href="#mcp-tools">MCP Tools</a> &middot;
    <a href="https://oluizcarvalho.github.io/ui-context/">Documentation</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node" />
    <img src="https://img.shields.io/badge/typescript-5.4%2B-blue.svg" alt="TypeScript" />
    <img src="https://img.shields.io/badge/MCP-compatible-purple.svg" alt="MCP" />
  </p>
</p>

---

**ui-context** extracts component metadata (props, events, methods, slots, design tokens) from your React and Angular component libraries and exposes them via an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server. This gives AI assistants like **Claude Desktop**, **Cursor**, and other MCP-compatible tools deep knowledge of your design system.

## Features

- **Multi-Framework** — First-class support for React and Angular, with an extensible parser registry
- **Universal Schema** — Framework-agnostic component metadata representation
- **MCP Integration** — Stdio-based MCP server compatible with Claude Desktop, Cursor, and more
- **Intelligent Search** — Find components by name, category, props, or free-text query with relevance scoring
- **Auto-Discovery** — Extracts examples from Storybook stories and JSDoc tags
- **Design Tokens** — Captures colors, spacing, typography, and other tokens
- **Validation** — CLI command to check metadata completeness and quality
- **TypeScript First** — Full type safety across the entire stack

## Architecture

```
ui-context/
├── packages/
│   ├── core/              # Universal schema & parser interface
│   ├── parser-react/      # React parser (react-docgen)
│   ├── parser-angular/    # Angular parser (ts-morph)
│   ├── mcp-server/        # MCP server runtime
│   └── cli/               # CLI tool
└── examples/
    ├── react-sample-lib/
    └── angular-sample-lib/
```

| Package | Description |
|---------|-------------|
| `@ui-context/core` | Universal component schema, parser interface, and plugin registry |
| `@ui-context/parser-react` | Parses React components using react-docgen (TSX, JSX, TS, JS) |
| `@ui-context/parser-angular` | Parses Angular components using ts-morph (decorators + signals) |
| `@ui-context/mcp-server` | Creates and runs MCP servers from extracted metadata |
| `@ui-context/cli` | CLI to generate, validate, and serve component metadata |

## Quick Start

### 1. Install

```bash
git clone https://github.com/oluizcarvalho/ui-context.git
cd ui-context
npm install
npm run build
```

### 2. Generate metadata from your component library

```bash
# React
npx ui-context generate -s ./path/to/components -p react -o ./output

# Angular
npx ui-context generate -s ./path/to/components -p angular -o ./output
```

This produces two files:
- `components.json` — Extracted component metadata
- `mcp-config.json` — Ready-to-use config snippet for AI tools

### 3. Validate metadata quality

```bash
npx ui-context validate -d ./output/components.json
```

### 4. Start the MCP server

```bash
npx ui-context serve -d ./output/components.json
```

### 5. Connect to Claude Desktop or Cursor

Copy the generated `mcp-config.json` into your tool's MCP configuration:

**Claude Desktop** (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "my-design-system": {
      "command": "node",
      "args": ["path/to/ui-context/packages/cli/dist/index.js", "serve", "-d", "path/to/components.json"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "my-design-system": {
      "command": "node",
      "args": ["path/to/ui-context/packages/cli/dist/index.js", "serve", "-d", "path/to/components.json"]
    }
  }
}
```

## CLI Commands

### `ui-context generate`

Extract component metadata from source files.

```
Usage: ui-context generate [options]

Options:
  -s, --source <path>        Source directory (required)
  -p, --parser <name>        Parser to use: "react" or "angular" (required)
  -o, --output <path>        Output directory (default: ./ui-context-output)
  --name <name>              Library name (defaults to directory name)
  --include <patterns...>    Glob patterns to include
  --exclude <patterns...>    Glob patterns to exclude
```

### `ui-context serve`

Start an MCP server from generated metadata.

```
Usage: ui-context serve [options]

Options:
  -d, --data <path>    Path to components.json (required)
```

### `ui-context validate`

Check metadata for completeness and quality.

```
Usage: ui-context validate [options]

Options:
  -d, --data <path>    Path to components.json (required)
```

Validation checks:
- **Errors** — Missing library name, no components, missing component names
- **Warnings** — Missing descriptions, untyped props, missing examples

## MCP Tools

Once the server is running, AI assistants can use these tools:

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_components` | List all components, optionally filtered by category | `category?: string` |
| `get_component` | Get detailed metadata for a specific component | `name: string` |
| `search_components` | Search components by keyword with relevance scoring | `query: string` |
| `get_usage_example` | Get code examples for a component | `name: string` |
| `get_design_tokens` | Retrieve design tokens (colors, spacing, etc.) | `category?: string` |

## Programmatic API

### Core

```typescript
import { ParserRegistry } from "@ui-context/core";
import type { ComponentMetadata, LibraryMetadata } from "@ui-context/core";
```

### Parsers

```typescript
import { createParser } from "@ui-context/parser-react";
// or
import { createParser } from "@ui-context/parser-angular";

const parser = createParser();
const components = await parser.parse({ sourcePath: "./src/components" });
```

### MCP Server

```typescript
import { createMcpServer, startServer } from "@ui-context/mcp-server";

// From metadata object
const server = createMcpServer(libraryMetadata);

// From file
await startServer("./components.json");
```

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
