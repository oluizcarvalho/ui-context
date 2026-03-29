import * as fs from "node:fs";
import * as path from "node:path";
import type { Command } from "commander";
import type { LibraryMetadata } from "@ui-context/core";
import { createMcpServer } from "@ui-context/mcp-server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export function registerServeCommand(program: Command): void {
  program
    .command("serve")
    .description("Start an MCP server from previously generated component metadata")
    .requiredOption("-d, --data <path>", "Path to components.json metadata file")
    .action(async (opts) => {
      const { default: chalk } = await import("chalk");

      const dataPath = path.resolve(opts.data);

      if (!fs.existsSync(dataPath)) {
        console.error(chalk.red(`Metadata file not found: ${dataPath}`));
        console.error(chalk.dim('Run "ui-context generate" first to create the metadata file.'));
        process.exit(1);
      }

      try {
        const raw = fs.readFileSync(dataPath, "utf-8");
        const metadata: LibraryMetadata = JSON.parse(raw);

        console.error(
          chalk.green(
            `Starting MCP server for "${metadata.name}" (${metadata.components.length} components)...`,
          ),
        );

        const server = createMcpServer(metadata);
        const transport = new StdioServerTransport();
        await server.connect(transport);
      } catch (error) {
        console.error(chalk.red(`Failed to start MCP server: ${String(error)}`));
        process.exit(1);
      }
    });
}
