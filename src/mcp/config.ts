import { getConfigManager } from "../config/manager.js";
import type { MCPServerConfig } from "./types.js";

export type MCPConfig = {
  servers: Record<string, MCPServerConfig>;
};

export function loadMCPConfig(): MCPConfig {
  const manager = getConfigManager();
  const settings = manager.loadProjectSettings();

  const servers = settings.mcpServers || {};
  return { servers };
}
