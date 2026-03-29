import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LibraryMetadata } from "@ui-context/core";

export function registerGetUsageExample(server: McpServer, metadata: LibraryMetadata): void {
  server.tool(
    "get_usage_example",
    "Get real usage examples for a component. Returns code snippets from Storybook, tests, or documentation.",
    {
      name: z.string().describe("Component name (e.g. 'Button', 'DataTable')"),
    },
    async ({ name }) => {
      const component = metadata.components.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() ||
          c.selector?.toLowerCase() === name.toLowerCase(),
      );

      if (!component) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Component "${name}" not found.`,
            },
          ],
          isError: true,
        };
      }

      if (component.examples.length === 0) {
        // Generate a basic usage example from props
        const exampleProps = component.props
          .filter((p) => p.required)
          .map((p) => {
            if (p.type === "string") return `${p.name}="value"`;
            if (p.type === "boolean") return p.name;
            if (p.type === "number") return `${p.name}={0}`;
            return `${p.name}={${p.type}}`;
          })
          .join(" ");

        const generatedExample =
          component.framework === "angular"
            ? `<${component.selector ?? component.name} ${exampleProps}></${component.selector ?? component.name}>`
            : `<${component.name} ${exampleProps} />`;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  component: component.name,
                  note: "No examples found in source. Here is a generated basic usage:",
                  examples: [
                    {
                      title: "Basic usage",
                      code: generatedExample,
                      language: component.framework === "angular" ? "html" : "tsx",
                    },
                  ],
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                component: component.name,
                examples: component.examples,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
