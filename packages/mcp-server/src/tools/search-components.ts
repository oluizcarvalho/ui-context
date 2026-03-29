import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LibraryMetadata, ComponentMetadata } from "@ui-context/core";

function scoreMatch(component: ComponentMetadata, query: string): number {
  const lowerQuery = query.toLowerCase();
  const terms = lowerQuery.split(/\s+/);
  let score = 0;

  for (const term of terms) {
    // Name match (highest weight)
    if (component.name.toLowerCase().includes(term)) score += 10;
    if (component.name.toLowerCase() === term) score += 20;

    // Selector match
    if (component.selector?.toLowerCase().includes(term)) score += 8;

    // Description match
    if (component.description.toLowerCase().includes(term)) score += 5;

    // Category match
    if (component.category?.toLowerCase().includes(term)) score += 4;

    // Prop name match
    for (const prop of component.props) {
      if (prop.name.toLowerCase().includes(term)) score += 2;
      if (prop.description.toLowerCase().includes(term)) score += 1;
    }

    // Event name match
    for (const event of component.events) {
      if (event.name.toLowerCase().includes(term)) score += 2;
    }
  }

  return score;
}

export function registerSearchComponents(server: McpServer, metadata: LibraryMetadata): void {
  server.tool(
    "search_components",
    "Search components by name, functionality, or keyword. Returns matching components ranked by relevance.",
    {
      query: z.string().describe("Search query (e.g. 'button', 'data table', 'form input')"),
    },
    async ({ query }) => {
      const results = metadata.components
        .map((c) => ({ component: c, score: scoreMatch(c, query) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((r) => ({
          name: r.component.name,
          description: r.component.description,
          category: r.component.category,
          selector: r.component.selector,
          relevance: r.score,
        }));

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No components found matching "${query}". Try different keywords.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  );
}
