#!/usr/bin/env node

import { Command } from "commander";
import { registerGenerateCommand } from "./commands/generate.js";
import { registerServeCommand } from "./commands/serve.js";
import { registerValidateCommand } from "./commands/validate.js";

const program = new Command();

program
  .name("ui-context")
  .description("Generate MCP Servers from frontend component libraries")
  .version("0.1.0");

registerGenerateCommand(program);
registerServeCommand(program);
registerValidateCommand(program);

program.parse();
