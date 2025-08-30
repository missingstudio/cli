import { getConfigManager } from "../config/manager.js";
import type { Provider } from "./types.js";

export type AgentConfig = {
  provider?: Provider;
  model?: string;
};

export function loadAgentConfig(): AgentConfig {
  const manager = getConfigManager();
  const settings = manager.loadProjectSettings();

  const provider = settings.provider || undefined;
  const model = settings.model || undefined;

  return { provider, model };
}
