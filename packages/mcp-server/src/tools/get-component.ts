import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LibraryMetadata } from "@ui-context/core";

export function registerGetComponent(server: McpServer, metadata: LibraryMetadata): void {
  server.tool(
    "get_component",
    "Get detailed information about a specific component including all props, events, methods, slots, types, and defaults.",
    {
      name: z.string().describe("Component name (e.g. 'Button', 'DataTable')"),
    },
    async ({ name }) => {
      const component = metadata.components.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() ||
          c.selector?.toLowerCase() === name.toLowerCase(),
      );

      if (!component) {
        const available = metadata.components.map((c) => c.name).join(", ");
        return {
          content: [
            {
              type: "text" as const,
              text: `Component "${name}" not found. Available components: ${available}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(component, null, 2),
          },
        ],
      };
    },
  );
}
