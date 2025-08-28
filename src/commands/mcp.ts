import React from "react";
import { Command } from "commander";
import { render } from "ink";
import { MCPList } from "../components/mcp/mcp-list.js";
import { MCPTest } from "../components/mcp/mcp-test.js";

export function createMCPCommand(): Command {
  const mcp = new Command("mcp");
  mcp.description("Manage MCP (Model Context Protocol) servers");

  mcp
    .command("list")
    .description("List configured MCP servers (checks health)")
    .action(async function (this: Command) {
      const program = this.parent?.parent;
      const verbose = program?.opts<{ verbose?: boolean }>().verbose ?? false;

      const { waitUntilExit } = render(
        React.createElement(MCPList, { verbose }),
      );
      await waitUntilExit();
    });

  mcp
    .command("test <name>")
    .description("Test connection to an MCP server")
    .action(async (name: string) => {
      const { waitUntilExit } = render(React.createElement(MCPTest, { name }));
      await waitUntilExit();
    });

  return mcp;
}
