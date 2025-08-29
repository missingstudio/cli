import React from "react";
import { Command } from "commander";
import { render } from "ink";
import chalk from "chalk";
import { MCPList } from "../components/mcp/mcp-list.js";
import { MCPTest } from "../components/mcp/mcp-test.js";
import { getDefaultConfigPath } from "../config/manager.js";
import { TRANSPORT_TYPES } from "../mcp/constants.js";
import { parseKeyValue } from "../mcp/utils.js";
import { addMCPServer, removeMCPServer } from "../mcp/config.js";
import { getMCPClientManager } from "../mcp/manager.js";
import type { MCPServerConfig, TransportType } from "../mcp/types.js";

export function createMCPCommand(): Command {
  const mcp = new Command("mcp");
  mcp.description("Manage MCP (Model Context Protocol) servers");

  mcp
    .command("add")
    .description("Add a new MCP server")
    .argument("<name>", "Server name")
    .option(
      "-t, --transport <type>",
      "Transport type: stdio | sse | streamable-http",
      "stdio",
    )
    .option(
      "-C, --command <command>",
      "Command to run the server (for stdio transport)",
    )
    .option(
      "-a, --args [args...]",
      "Arguments for the server command (for stdio transport)",
      [],
    )
    .option("-u, --url <url>", "URL for SSE/HTTP transport")
    .option("-e, --env [envs...]", "Environment variables (KEY=VALUE)")
    .option("-H, --header [headers...]", "HTTP headers (KEY=VALUE)")
    .option("--timeout <ms>", "Operation timeout in ms", (v) => parseInt(v, 10))
    .option("--enabled", "Add server as enabled", true)
    .action(async function (this: Command, name: string, opts: any) {
      let config: MCPServerConfig;
      switch (opts.transport as TransportType) {
        case TRANSPORT_TYPES.STDIO:
          config = {
            type: "stdio",
            command: opts.command,
            args: opts.args,
            env: parseKeyValue(opts.env),
            timeout: opts.timeout,
            enabled: opts.enabled,
          };
          break;
        case TRANSPORT_TYPES.SSE:
          config = {
            type: "sse",
            url: opts.url,
            headers: parseKeyValue(opts.header),
            timeout: opts.timeout,
            enabled: opts.enabled,
          };
          break;
        case TRANSPORT_TYPES.STREAMABLE_HTTP:
          config = {
            type: "streamable-http",
            url: opts.url,
            headers: parseKeyValue(opts.header),
            timeout: opts.timeout,
            enabled: opts.enabled,
          };
          break;
        default:
          throw new Error(`Unknown transport type: ${opts.transport}`);
      }
      await addMCPServer(name, config);
      const path = getDefaultConfigPath();
      console.log(chalk.green(`✓ Added MCP server: ${name} to ${path}`));
    });

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
    .command("remove <name>")
    .description("Remove an MCP server")
    .action(async (name: string) => {
      const mcpClientManager = getMCPClientManager();
      await mcpClientManager.removeClient(name);

      await removeMCPServer(name);
      console.log(chalk.green(`✓ Removed MCP server: ${name}`));
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
