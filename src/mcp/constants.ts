export const DEFAULT_TIMEOUT_MS = 60000;
export const TRANSPORT_TYPES = {
  STDIO: "stdio",
  SSE: "sse",
  HTTP: "http",
  WS: "ws",
  STREAMABLE_HTTP: "streamable-http",
} as const;

export const ERROR_MESSAGES = {
  CONNECTION_FAILED: "Failed to connect to MCP server",
  DISCONNECTION_FAILED: "Failed to disconnect from MCP server",
  NOT_CONNECTED: "Client not connected. Please call connect() first",

  NO_CLIENT_FOR_TOOL: "No client found for tool",
  TOOL_EXECUTION_FAILED: "Failed to execute tool",
  TOOL_LISTING_FAILED: "Failed to list tools",

  CLIENT_REGISTERED: "Client registered successfully",
  CLIENT_REMOVED: "Client removed successfully",
  CLIENT_ALREADY_REGISTERED: "Client already registered",

  UNSUPPORTED_TRANSPORT_TYPE: "Unsupported transport type",
};

export const LOG_PREFIXES = {
  MANAGER: "MCP Client Manager:",
  CLIENT: "MCP Client:",
  TOOL: "MCP Tool:",
  PROMPT: "MCP Prompt:",
  RESOURCE: "MCP Resource:",
};
