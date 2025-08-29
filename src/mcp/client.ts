import { Client } from "@modelcontextprotocol/sdk/client";
import type {
  GetPromptResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { createTransport } from "./transports.js";
import type {
  IMCPClient,
  MCPServerConfig,
  ToolSet,
  TransportType,
} from "./types.js";
import {
  DEFAULT_TIMEOUT_MS,
  ERROR_MESSAGES,
  LOG_PREFIXES,
} from "./constants.js";
import type { Logger } from "../logger/index.js";

export interface MCPClientOptions {
  logger?: Logger;
}

export class MCPClient implements IMCPClient {
  private logger?: Logger;
  private client?: Client;
  private transport?: Transport;
  private connected: boolean = false;
  private serverConfig: MCPServerConfig | null = null;

  constructor(
    private readonly name: string,
    private readonly config: MCPServerConfig,
    private readonly options: MCPClientOptions = {},
  ) {
    this.logger = options.logger;
  }

  get serverName(): string {
    return this.name;
  }

  get connectionState() {
    return this.connected;
  }

  get transportType(): TransportType {
    return this.config.type;
  }

  getClient(): Client | undefined {
    return this.client;
  }

  getServerConfig(): MCPServerConfig | null {
    return this.serverConfig;
  }

  async connect(): Promise<Client> {
    if (this.connected && this.client) {
      this.logger?.warn(
        `${LOG_PREFIXES.CLIENT} Already connected to ${this.serverName}`,
      );

      return this.client;
    }

    // Create MCP transport based on configuration
    this.transport = await createTransport(this.config);

    // Create MCP client
    this.client = new Client(
      {
        name: `mstudio-mcp-client-${this.name}`,
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      },
    );

    // Keep current server config for later operations
    this.serverConfig = this.config;

    const timeout = this._getOperationTimeout(this.config);
    await this.withTimeout(
      this.client!.connect(this.transport),
      timeout,
      "Client Connection timeout",
    );

    this.connected = true;
    return this.client;
  }

  async getConnectedClient(): Promise<Client> {
    if (this.connected && this.client) {
      return this.client;
    }

    return this.connect();
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      this.logger?.warn(
        `${LOG_PREFIXES.CLIENT} Already disconnected from ${this.serverName}`,
      );

      return;
    }

    this.logger?.info(
      `${LOG_PREFIXES.CLIENT} Disconnecting from ${this.serverName}`,
    );

    try {
      await this._cleanup();
      this.logger?.info(
        `${LOG_PREFIXES.CLIENT} Successfully disconnected from ${this.serverName}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger?.error(
        `${LOG_PREFIXES.CLIENT} ${ERROR_MESSAGES.DISCONNECTION_FAILED}: ${this.serverName}`,
        { serverName: this.serverName, error: errorMessage },
      );

      throw new Error(
        `${ERROR_MESSAGES.DISCONNECTION_FAILED}: ${errorMessage}`,
      );
    }
  }

  async getTools(): Promise<ToolSet> {
    this._ensureConnected();
    const timeout = this._getOperationTimeout();

    try {
      const result = await this.withTimeout(
        this.client!.listTools(),
        timeout,
        "List tools timeout",
      );

      const toolSet: ToolSet = {};
      result.tools.forEach((tool) => {
        toolSet[tool.name] = {
          description: tool.description || "",
          parameters: tool.inputSchema as any,
        };
      });

      this.logger?.debug(
        `${LOG_PREFIXES.TOOL} Retrieved ${Object.keys(toolSet).length} tools`,
        { serverName: this.serverName, toolCount: Object.keys(toolSet).length },
      );

      return toolSet;
    } catch (error) {
      this.logger?.error(`${LOG_PREFIXES.TOOL} Failed to retrieve tools`, {
        serverName: this.serverName,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new Error(
        `${ERROR_MESSAGES.TOOL_LISTING_FAILED}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async callTool(toolName: string, args: any): Promise<any> {
    this._ensureConnected();

    const timeout = this._getOperationTimeout(this.config);
    this.logger?.info(`${LOG_PREFIXES.TOOL} Calling tool: ${toolName}`, {
      toolName,
      serverName: this.serverName,
      timeout,
    });

    try {
      const result = await this.withTimeout(
        this.client!.callTool({ name: toolName, arguments: args }),
        timeout,
        `Tool execution timeout: ${toolName}`,
      );

      this.logger?.info(
        `${LOG_PREFIXES.TOOL} Tool executed successfully: ${toolName}`,
        { toolName, serverName: this.serverName },
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger?.error(
        `${LOG_PREFIXES.TOOL} Tool execution failed: ${toolName}`,
        { toolName, serverName: this.serverName, error: errorMessage },
      );

      throw new Error(
        `${ERROR_MESSAGES.TOOL_EXECUTION_FAILED}: ${errorMessage}`,
      );
    }
  }

  async listPrompts(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  async getPrompt(name: string, args?: any): Promise<GetPromptResult> {
    throw new Error("Method not implemented.");
  }

  async listResources(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  async readResource(uri: string): Promise<ReadResourceResult> {
    throw new Error("Method not implemented.");
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    message: string,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(message)), timeout),
      ),
    ]);
  }

  private _ensureConnected(): void {
    if (!this.connected || !this.client) {
      throw new Error(ERROR_MESSAGES.NOT_CONNECTED);
    }
  }

  private _getOperationTimeout(config?: MCPServerConfig): number {
    if (config?.timeout) {
      return config.timeout;
    }

    if (this.serverConfig?.timeout) {
      return this.serverConfig.timeout;
    }

    return DEFAULT_TIMEOUT_MS;
  }

  private async _cleanup(): Promise<void> {
    this.connected = false;

    await this.client?.close();
    this.client = undefined;

    await this.transport?.close();
    this.transport = undefined;

    this.serverConfig = null;
  }
}
