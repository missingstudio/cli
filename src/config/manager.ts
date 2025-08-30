import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { Provider } from "../agents/types.js";

export interface ProjectSettings {
  provider?: Provider;
  model?: string;

  mcpServers?: Record<string, any>;
  // allow other properties without typing them strictly
  [key: string]: unknown;
}

export function getDefaultConfigPath(): string {
  const home = os.homedir();
  return path.join(home, ".missingstudio", "settings.json");
}

export class ConfigManager {
  private static instance: ConfigManager;

  private projectSettingsPath: string;

  private constructor() {
    // user settings path: ~/.missingstudio/settings.json
    this.projectSettingsPath = path.join(
      os.homedir(),
      ".missingstudio",
      "settings.json",
    );
  }

  // get singleton instance
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private ensureDirectoryExists(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
  }

  public saveProjectSettings(settings: Partial<ProjectSettings>): void {
    try {
      this.ensureDirectoryExists(this.projectSettingsPath);

      // Read existing settings directly to avoid recursion
      let existingSettings: ProjectSettings = {};

      if (fs.existsSync(this.projectSettingsPath)) {
        try {
          const content = fs.readFileSync(this.projectSettingsPath, "utf-8");
          const settings = JSON.parse(content);
          existingSettings = { ...settings };
        } catch (error) {
          // If file is corrupted, use defaults
          console.warn("Corrupted project settings file, using defaults");
        }
      }

      const mergedSettings = { ...existingSettings, ...settings };

      fs.writeFileSync(
        this.projectSettingsPath,
        JSON.stringify(mergedSettings, null, 2),
      );

      fs.chmodSync(this.projectSettingsPath, 0o600);
    } catch (error) {
      console.error(
        "Failed to save project settings:",
        error instanceof Error ? error.message : "Unknown error",
      );
      throw error;
    }
  }

  public loadProjectSettings(): ProjectSettings {
    try {
      if (!fs.existsSync(this.projectSettingsPath)) {
        // Create default project settings if file doesn't exist
        this.saveProjectSettings({});

        return {};
      }

      const content = fs.readFileSync(this.projectSettingsPath, "utf-8");
      const settings = JSON.parse(content);

      // TODO:merge with defaults
      return settings;
    } catch (error) {
      console.warn(
        "Failed to load project settings:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return {};
    }
  }

  public getProjectSetting<K extends keyof ProjectSettings>(
    key: K,
  ): ProjectSettings[K] {
    const settings = this.loadProjectSettings();
    return settings[key];
  }
}

export function getConfigManager(): ConfigManager {
  return ConfigManager.getInstance();
}
