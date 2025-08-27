#!/usr/bin/env node
import "dotenv/config";
import { render } from "ink";
import React from "react";
import { Command } from "commander";

import App from "./ui/app.js";
import pkg from "../package.json" with { type: "json" };

const program = new Command();

program
  .name("mstudio")
  .description((pkg as any).description)
  .version((pkg as any).version, "-V, --version", "Output the version number");

// Common options
program
  .allowExcessArguments(true)
  .allowUnknownOption()
  .option("-c, --config <path>", "Path to config file")
  .option("-v, --verbose", "Enable verbose logging", false);

// If user supplies only options but no subcommand, show interactive UI
program.action(() => {
  render(React.createElement(App));
});

program.showHelpAfterError("(add --help for usage)");
program.configureHelp({ sortSubcommands: true, sortOptions: true });

await program.parseAsync(process.argv);
