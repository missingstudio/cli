#!/usr/bin/env node
import "dotenv/config";
import { render } from "ink";
import React from "react";
import { Command } from "commander";

import App from "./ui/app.js";
import pkg from "../package.json" with { type: "json" };
import { mcp } from "./commands/mcp.js";
import { loadAgentConfig } from "./agents/config.js";

async function main() {
  const program = new Command();

  program
    .name("mstudio")
    .description((pkg as any).description)
    .version(
      (pkg as any).version,
      "-V, --version",
      "Output the version number",
    );

  // Common options
  program
    .allowExcessArguments(true)
    .allowUnknownOption()
    .option("-c, --config <path>", "Path to config file")
    .option("-v, --verbose", "Enable verbose logging", false);

  program
    .command("interactive")
    .alias("i")
    .description("Start an interactive ui mode")
    .action(async function () {
      const { provider, model } = loadAgentConfig();

      const { waitUntilExit } = render(
        React.createElement(App, { provider, model }),
      );
      waitUntilExit().then(() => process.exit(0));
    });

  // Register built-in commands
  program.addCommand(mcp);

  // If user supplies only options but no subcommand, show interactive UI
  program.action(() => {
    const { provider, model } = loadAgentConfig();
    const { waitUntilExit } = render(
      React.createElement(App, { provider, model }),
    );
    waitUntilExit().then(() => process.exit(0));
  });

  program.showHelpAfterError("(add --help for usage)");
  program.configureHelp({ sortSubcommands: true, sortOptions: true });

  program.parse(process.argv);
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

main();
