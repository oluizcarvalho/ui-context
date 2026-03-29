import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LibraryMetadata } from "@ui-context/core";

export function registerGetDesignTokens(server: McpServer, metadata: LibraryMetadata): void {
  server.tool(
    "get_design_tokens",
    "Get design tokens (colors, spacing, typography, etc.) from the component library, if available.",
    {
      category: z.string().optional().describe("Token category filter (e.g. 'color', 'spacing', 'typography')"),
    },
    async ({ category }) => {
      const allTokens = metadata.tokens ?? [];

      // Also collect component-level tokens
      for (const component of metadata.components) {
        if (component.designTokens) {
          allTokens.push(...component.designTokens);
        }
      }

      if (allTokens.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No design tokens found in this library.",
            },
          ],
        };
      }

      let tokens = allTokens;
      if (category) {
        const lowerCategory = category.toLowerCase();
        tokens = tokens.filter((t) => t.category.toLowerCase() === lowerCategory);
      }

      // Group by category
      const grouped: Record<string, Array<{ name: string; value: string }>> = {};
      for (const token of tokens) {
        if (!grouped[token.category]) {
          grouped[token.category] = [];
        }
        grouped[token.category].push({ name: token.name, value: token.value });
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(grouped, null, 2),
          },
        ],
      };
    },
  );
}
