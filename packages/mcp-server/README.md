# @ui-context/mcp-server

MCP Server runtime for [ui-context](https://github.com/oluizcarvalho/ui-context). Creates a [Model Context Protocol](https://modelcontextprotocol.io/) server from extracted component metadata, enabling AI assistants to query your design system.

## Installation

```bash
npm install @ui-context/mcp-server
```

## Usage

```typescript
import { createMcpServer, startServer } from "@ui-context/mcp-server";

// Start from a metadata file
await startServer("./components.json");

// Or create from a metadata object
const server = createMcpServer(libraryMetadata);
```

## MCP Tools

The server exposes 5 tools that AI assistants can use:

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_components` | List all components, optionally filtered by category | `category?: string` |
| `get_component` | Get detailed metadata for a specific component | `name: string` |
| `search_components` | Search by keyword with relevance scoring | `query: string` |
| `get_usage_example` | Get code examples for a component | `name: string` |
| `get_design_tokens` | Retrieve design tokens (colors, spacing, etc.) | `category?: string` |

## Compatible with

- Claude Desktop
- Cursor
- Any MCP-compatible AI tool

## Links

- [Documentation](https://oluizcarvalho.github.io/ui-context/)
- [GitHub](https://github.com/oluizcarvalho/ui-context/tree/main/packages/mcp-server)
- [All packages](https://www.npmjs.com/org/ui-context)

## License

MIT
