import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

export function resolveCommand(command: string): string {
  // If it's already an absolute path, return as-is
  if (path.isAbsolute(command)) {
    return command;
  }

  // Check if it's a relative path from current working directory
  const cwdPath = path.resolve(process.cwd(), command);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  // Check if it's a bundled script relative to module
  try {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    const bundledPath = path.resolve(moduleDir, "../../", command);
    if (fs.existsSync(bundledPath)) {
      return bundledPath;
    }
  } catch {
    // Ignore errors from import.meta.url resolution
  }

  // Return original command (might be in PATH)
  return command;
}

export function resolveArgs(args: string[]): string[] {
  return args.map((arg) => {
    // If argument looks like a path (contains / or \), try to resolve it
    if (arg.includes("/") || arg.includes("\\")) {
      const resolved = resolveCommand(arg);
      return resolved;
    }
    return arg;
  });
}

export function mergeEnvironment(
  configEnvironment: Record<string, string>,
): Record<string, string> {
  const processEnvironment = Object.fromEntries(
    Object.entries(process.env).filter(([_, value]) => value !== undefined),
  ) as Record<string, string>;

  return {
    ...processEnvironment,
    ...configEnvironment,
  };
}
