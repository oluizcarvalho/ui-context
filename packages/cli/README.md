# @ui-context/cli

CLI tool for [ui-context](https://github.com/oluizcarvalho/ui-context). Generate MCP Servers from your React and Angular component libraries.

## Installation

```bash
npm install -g @ui-context/cli
```

Or use directly with npx:

```bash
npx @ui-context/cli generate -s ./src/components -p react
```

## Commands

### `ui-context generate`

Extract component metadata from source files.

```bash
ui-context generate -s ./src/components -p react -o ./output
```

| Option | Description | Required |
|--------|-------------|----------|
| `-s, --source <path>` | Source directory | Yes |
| `-p, --parser <name>` | `react` or `angular` | Yes |
| `-o, --output <path>` | Output directory (default: `./ui-context-output`) | No |
| `--name <name>` | Library name | No |
| `--include <patterns...>` | Glob patterns to include | No |
| `--exclude <patterns...>` | Glob patterns to exclude | No |

### `ui-context serve`

Start an MCP server from generated metadata.

```bash
ui-context serve -d ./output/components.json
```

### `ui-context validate`

Check metadata for completeness and quality.

```bash
ui-context validate -d ./output/components.json
```

## Quick Start

```bash
# 1. Generate metadata
npx @ui-context/cli generate -s ./src/components -p react

# 2. Validate
npx @ui-context/cli validate -d ./ui-context-output/components.json

# 3. Start MCP server
npx @ui-context/cli serve -d ./ui-context-output/components.json
```

## MCP Configuration

Add to Claude Desktop (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "my-design-system": {
      "command": "npx",
      "args": ["-y", "@ui-context/cli", "serve", "-d", "path/to/components.json"]
    }
  }
}
```

## Links

- [Documentation](https://oluizcarvalho.github.io/ui-context/)
- [GitHub](https://github.com/oluizcarvalho/ui-context/tree/main/packages/cli)
- [All packages](https://www.npmjs.com/org/ui-context)

## License

MIT
