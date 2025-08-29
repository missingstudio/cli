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

export function addMCPServer(name: string, config: MCPServerConfig): void {
  const configManager = getConfigManager();
  const { servers } = loadMCPConfig();

  const updated = { ...servers, [name]: config };
  configManager.saveProjectSettings({ mcpServers: updated });
}

export function removeMCPServer(name: string): void {
  const configManager = getConfigManager();
  const { servers } = loadMCPConfig();

  if (servers) {
    delete servers[name];
    configManager.saveProjectSettings({ mcpServers: servers });
  }
}
