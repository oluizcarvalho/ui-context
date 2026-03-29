import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LibraryMetadata } from "@ui-context/core";

export function registerListComponents(server: McpServer, metadata: LibraryMetadata): void {
  server.tool(
    "list_components",
    "List all available components in the library with brief descriptions. Optionally filter by category.",
    {
      category: z.string().optional().describe("Filter by component category (e.g. 'Form', 'Layout', 'Data')"),
    },
    async ({ category }) => {
      let components = metadata.components;

      if (category) {
        const lowerCategory = category.toLowerCase();
        components = components.filter(
          (c) => c.category?.toLowerCase() === lowerCategory,
        );
      }

      const list = components.map((c) => ({
        name: c.name,
        description: c.description,
        category: c.category ?? "Uncategorized",
        selector: c.selector,
        propsCount: c.props.length,
        eventsCount: c.events.length,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(list, null, 2),
          },
        ],
      };
    },
  );
}
