import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LibraryMetadata } from "@ui-context/core";
import { registerListComponents } from "./tools/list-components.js";
import { registerGetComponent } from "./tools/get-component.js";
import { registerSearchComponents } from "./tools/search-components.js";
import { registerGetUsageExample } from "./tools/get-usage-example.js";
import { registerGetDesignTokens } from "./tools/get-design-tokens.js";

/**
 * Create an MCP Server instance with all ui-context tools registered.
 */
export function createMcpServer(metadata: LibraryMetadata): McpServer {
  const server = new McpServer({
    name: `ui-context: ${metadata.name}`,
    version: "0.1.0",
  });

  registerListComponents(server, metadata);
  registerGetComponent(server, metadata);
  registerSearchComponents(server, metadata);
  registerGetUsageExample(server, metadata);
  registerGetDesignTokens(server, metadata);

  return server;
}
