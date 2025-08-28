import type { Command } from "commander";
import { createMCPCommand } from "./mcp.js";

export function registerBuiltInCommands(program: Command) {
  program.addCommand(createMCPCommand());
}
