import EventEmitter from "events";
import type {
  GetPromptResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import type {
  IMCPClient,
  IMCPClientManager,
  MCPServerConfig,
  ServerConfigs,
  ToolExecutionResult,
  ToolSet,
} from "./types.js";
import { MCPClient } from "./client.js";
import { ERROR_MESSAGES, LOG_PREFIXES } from "./constants.js";
import { Logger } from "../logger/index.js";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  clientName: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  serverName: string;
}

interface ClientRegistryEntry {
  client: IMCPClient;
  config: MCPServerConfig;
  connected: boolean;
  lastSeen: number;
  failureCount: number;
}

export interface MCPClientManagerOptions {
  logger?: Logger;
}

export class MCPClientManager
  extends EventEmitter
  implements IMCPClientManager
{
  private static instance: MCPClientManager;
  protected logger?: Logger;
  protected verbose = false;

  private clients: Map<string, ClientRegistryEntry> = new Map();
  private failedConnections: Record<string, string> = {};

  private toolCache = new Map<string, CacheEntry<ToolSet[keyof ToolSet]>>();
  private toolClientMap = new Map<string, string>();
  private promptCache = new Map<string, CacheEntry<string[]>>();
  private promptClientMap = new Map<string, string>();
  private resourceCache = new Map<string, CacheEntry<string[]>>();
  private resourceClientMap = new Map<string, string>();

  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private maxCacheSize = 1000;

  constructor(options: MCPClientManagerOptions = {}) {
    super();
    this.logger = options.logger;
  }

  public static getInstance(): MCPClientManager {
    if (!MCPClientManager.instance) {
      MCPClientManager.instance = new MCPClientManager();
    }
    return MCPClientManager.instance;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  registerClient(name: string, client: IMCPClient): void {
    if (this.clients.has(name)) {
      this.logger?.warn(
        `${LOG_PREFIXES.MANAGER} ${ERROR_MESSAGES.CLIENT_ALREADY_REGISTERED}: ${name}`,
        { clientName: name },
      );
      return;
    }

    this.clients.set(name, {
      client,
      config: {} as MCPServerConfig,
      connected: false,
      lastSeen: Date.now(),
      failureCount: 0,
    });

    this.logger?.info(
      `${LOG_PREFIXES.MANAGER} ${ERROR_MESSAGES.CLIENT_REGISTERED}: ${name}`,
      { clientName: name, totalClients: this.clients.size },
    );
  }

  async getAllTools(): Promise<ToolSet> {
    const allTools: ToolSet = {};
    const errors: string[] = [];

    const toolPromises = Array.from(this.clients.entries()).map(
      async ([name, currentClient]) => {
        if (!currentClient.connected) return;

        try {
          const tools = await currentClient.client.getTools();
          Object.entries(tools).forEach(([toolName, toolDef]) => {
            // Handle tool name conflicts by prefixing with client name
            const finalToolName = allTools[toolName]
              ? `${name}.${toolName}`
              : toolName;
            allTools[finalToolName] = toolDef;

            // Update O(1) lookup cache
            this.toolClientMap.set(finalToolName, name);
            this.toolCache.set(finalToolName, {
              data: toolDef,
              timestamp: Date.now(),
              clientName: name,
            });
          });

          this.logger?.debug(
            `${LOG_PREFIXES.MANAGER} Retrieved ${Object.keys(tools).length} tools from ${name}`,
            { clientName: name, toolCount: Object.keys(tools).length },
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push(`${name}: ${errorMessage}`);

          this._updateClientFailure(name);

          this.logger?.error(
            `${LOG_PREFIXES.MANAGER} Failed to get tools from ${name}`,
            { clientName: name, error: errorMessage },
          );
        }
      },
    );

    await Promise.allSettled(toolPromises);
    if (errors.length > 0 && Object.keys(allTools).length === 0) {
      throw new Error(
        `Failed to retrieve tools from all clients: ${errors.join("; ")}`,
      );
    }

    this._cleanupCache(this.toolCache);

    this.logger?.debug(
      `${LOG_PREFIXES.MANAGER} Retrieved ${Object.keys(allTools).length} total tools`,
      {
        toolCount: Object.keys(allTools).length,
        clientCount: this.clients.size,
      },
    );

    return allTools;
  }

  getToolClient(toolName: string): IMCPClient | undefined {
    const clientName = this.toolClientMap.get(toolName);
    if (!clientName) return undefined;

    const currentClient = this.clients.get(clientName);
    return currentClient?.connected ? currentClient.client : undefined;
  }

  async executeTool(toolName: string, args: any): Promise<ToolExecutionResult> {
    let client = this.getToolClient(toolName);

    if (!client) {
      await this._refreshToolCache();
      client = this.getToolClient(toolName);

      if (!client) {
        throw new Error(`${ERROR_MESSAGES.NO_CLIENT_FOR_TOOL}: ${toolName}`);
      }
    }
    const result = await client.callTool(toolName, args);
    this.logger?.info(
      `${LOG_PREFIXES.MANAGER} Tool executed successfully: ${toolName}`,
      { toolName },
    );

    return result;
  }

  listAllPrompts(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  getPromptClient(promptName: string): IMCPClient | undefined {
    throw new Error("Method not implemented.");
  }

  getPrompt(name: string, args?: any): Promise<GetPromptResult> {
    throw new Error("Method not implemented.");
  }

  listAllResources(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  getResourceClient(resourceUri: string): IMCPClient | undefined {
    throw new Error("Method not implemented.");
  }

  readResource(uri: string): Promise<ReadResourceResult> {
    throw new Error("Method not implemented.");
  }

  async addServer(name: string, config: MCPServerConfig): Promise<void> {
    try {
      if (!this.clients.has(name)) {
        const client = new MCPClient(name, config, { logger: this.logger });
        this.registerClient(name, client);
      }

      const currentClient = this.clients.get(name)!;
      currentClient.config = config;

      // Connect mcp client
      await currentClient.client.connect();

      currentClient.connected = true;
      currentClient.lastSeen = Date.now();
      currentClient.failureCount = 0;

      delete this.failedConnections[name];
      await this._refreshAllCaches();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.failedConnections[name] = errorMessage;
      this._updateClientFailure(name);

      this.logger?.error(
        `${LOG_PREFIXES.MANAGER} Failed to connect to server: ${name}`,
        {
          serverName: name,
          error: errorMessage,
        },
      );

      throw error;
    }
  }

  async initializeFromConfig(serverConfigs: ServerConfigs): Promise<void> {
    const connectionPromises: Promise<void>[] = [];

    // Process all server configurations
    for (const [name, config] of Object.entries(serverConfigs)) {
      // Skip disabled servers
      // if (!config.enabled) continue;

      const connectionPromise = this.addServer(name, config);
      connectionPromises.push(connectionPromise);
    }

    // Wait for all connections to complete
    await Promise.allSettled(connectionPromises);
  }

  getClients(): Map<string, IMCPClient> {
    const clientMap = new Map<string, IMCPClient>();

    for (const [name, entry] of this.clients.entries()) {
      clientMap.set(name, entry.client);
    }

    return clientMap;
  }

  getFailedConnections(): { [key: string]: string } {
    return { ...this.failedConnections };
  }

  async removeClient(name: string): Promise<void> {
    const currentClient = this.clients.get(name);

    if (!currentClient) {
      this.logger?.warn(
        `${LOG_PREFIXES.MANAGER} Client not found for removal: ${name}`,
        { clientName: name },
      );
      return;
    }

    if (currentClient.connected) await currentClient.client.disconnect();

    // Remove from registry
    this.clients.delete(name);
    this._removeClientFromCaches(name);
    delete this.failedConnections[name];

    this.logger?.info(
      `${LOG_PREFIXES.MANAGER} Client removed successfully: ${name}`,
    );
  }

  async disconnectAll(): Promise<void> {
    this.logger?.info(`${LOG_PREFIXES.MANAGER} Disconnecting all clients`, {
      clientCount: this.clients.size,
    });

    const disconnectPromises = Array.from(this.clients.entries()).map(
      async ([name, entry]) => {
        try {
          if (entry.connected) await entry.client.disconnect();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          this.logger?.warn(
            `${LOG_PREFIXES.MANAGER} Error disconnecting client: ${name}`,
            { clientName: name, error: errorMessage },
          );
        }
      },
    );

    await Promise.allSettled(disconnectPromises);

    // Clear all state
    this.clients.clear();
    this.failedConnections = {};
    this._clearAllCaches();

    this.logger?.info(
      `${LOG_PREFIXES.MANAGER} All clients disconnected and caches cleared`,
    );
  }

  private _clearAllCaches(): void {
    this.toolCache.clear();
    this.toolClientMap.clear();
    this.promptCache.clear();
    this.promptClientMap.clear();
    this.resourceCache.clear();
    this.resourceClientMap.clear();
  }

  private _removeClientFromCaches(clientName: string): void {
    // Remove from tool cache
    for (const [toolName, entry] of this.toolCache.entries()) {
      if (entry.clientName === clientName) {
        this.toolCache.delete(toolName);
        this.toolClientMap.delete(toolName);
      }
    }
  }

  private async _refreshToolCache(): Promise<void> {
    this.toolCache.clear();
    this.toolClientMap.clear();

    await this.getAllTools(); // This will repopulate the cache
  }

  private _cleanupCache<T>(cache: Map<string, CacheEntry<T>>): void {
    if (cache.size <= this.maxCacheSize) {
      return;
    }

    const now = Date.now();
    const entriesToRemove: string[] = [];

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > this.cacheTimeout) {
        entriesToRemove.push(key);
      }
    }

    // Remove expired entries
    entriesToRemove.forEach((key) => cache.delete(key));

    // If still over limit, remove oldest entries
    if (cache.size > this.maxCacheSize) {
      const sortedEntries = Array.from(cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp,
      );

      const toRemove = sortedEntries.slice(0, cache.size - this.maxCacheSize);
      toRemove.forEach(([key]) => cache.delete(key));
    }
  }

  private _updateClientFailure(clientName: string): void {
    const entry = this.clients.get(clientName);
    if (entry) {
      entry.failureCount++;
      entry.connected = false;
      entry.lastSeen = Date.now();
    }
  }

  private async _refreshAllCaches(): Promise<void> {
    await Promise.allSettled([this._refreshToolCache()]);
  }
}

export function getMCPClientManager(): MCPClientManager {
  return MCPClientManager.getInstance();
}
