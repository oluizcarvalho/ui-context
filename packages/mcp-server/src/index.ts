import * as fs from "node:fs";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { LibraryMetadata } from "@ui-context/core";
import { createMcpServer } from "./server.js";

export { createMcpServer } from "./server.js";

/**
 * Start the MCP server from a metadata JSON file via stdio transport.
 */
export async function startServer(metadataPath: string): Promise<void> {
  const raw = fs.readFileSync(metadataPath, "utf-8");
  const metadata: LibraryMetadata = JSON.parse(raw);

  const server = createMcpServer(metadata);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Allow running directly: node dist/index.js <path-to-components.json>
if (require.main === module) {
  const metadataArg = process.argv[2];
  if (metadataArg) {
    startServer(metadataArg).catch((err) => {
      console.error("Failed to start MCP server:", err);
      process.exit(1);
    });
  }
}
