import type { Client } from "@modelcontextprotocol/sdk/client";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type {
  GetPromptResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";

// Transport and Connection Types

/*
 * List of all MCP client transport types.
 * Which define the communication protocol used to connect MCP servers.
 */
export type TransportType = "stdio" | "sse" | "http" | "streamable-http" | "ws";

export interface BaseServerConfig {
  type: TransportType;
  enabled?: boolean;
  timeout?: number;
}

export interface StdioServerConfig extends BaseServerConfig {
  type: "stdio";
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface SSEServerConfig extends BaseServerConfig {
  type: "sse";
  url: string;
  headers?: Record<string, string>;
}

export interface StreamableHttpServerConfig extends BaseServerConfig {
  type: "streamable-http";
  url: string;
  headers?: Record<string, string>;
}
export interface WebSocketServerConfig extends BaseServerConfig {
  type: "ws";
  url: string;
}

export type MCPServerConfig =
  | StdioServerConfig
  | SSEServerConfig
  | StreamableHttpServerConfig
  | WebSocketServerConfig;

export type ServerConfigs = Record<string, MCPServerConfig>;

// Tools
export interface ToolParameterSchema {
  type: string;
  description?: string;
  [key: string]: any;
}

export interface ToolParameterDefinition {
  [parameterName: string]: ToolParameterSchema;
}

export interface ToolParameters {
  type: string;
  properties: ToolParameterDefinition;
  required?: string[];
}

export interface Tool {
  description: string;
  parameters: ToolParameters;
}

export interface ToolSet {
  [toolName: string]: Tool;
}

export type ToolExecutionResult = any;

// Client Interface
export interface IMCPClient {
  serverName: string;
  transportType: TransportType;
  connectionState: boolean;
  getClient(): Client | undefined;
  getServerConfig(): MCPServerConfig | null;

  connect(): Promise<Client>;
  getConnectedClient(): Promise<Client>;
  disconnect(): Promise<void>;

  getTools(): Promise<ToolSet>;
  callTool(name: string, args: any): Promise<ToolExecutionResult>;

  listPrompts(): Promise<string[]>;
  getPrompt(name: string, args?: any): Promise<GetPromptResult>;

  listResources(): Promise<string[]>;
  readResource(uri: string): Promise<ReadResourceResult>;
}

// Manager Interface
export interface IMCPClientManager {
  registerClient(name: string, client: IMCPClient): void;

  getAllTools(): Promise<ToolSet>;
  getToolClient(toolName: string): IMCPClient | undefined;
  executeTool(toolName: string, args: any): Promise<ToolExecutionResult>;

  listAllPrompts(): Promise<string[]>;
  getPromptClient(promptName: string): IMCPClient | undefined;
  getPrompt(name: string, args?: any): Promise<GetPromptResult>;

  listAllResources(): Promise<string[]>;
  getResourceClient(resourceUri: string): IMCPClient | undefined;
  readResource(uri: string): Promise<ReadResourceResult>;

  addServer(name: string, config: MCPServerConfig): Promise<void>;
  initializeFromConfig(serverConfigs: ServerConfigs): Promise<void>;

  getClients(): Map<string, IMCPClient>;
  getFailedConnections(): { [key: string]: string };
  removeClient(name: string): Promise<void>;

  disconnectAll(): Promise<void>;
}
