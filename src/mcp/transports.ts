import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { mergeEnvironment, resolveArgs, resolveCommand } from "./utils.js";
import { ERROR_MESSAGES, TRANSPORT_TYPES } from "./constants.js";
import type {
  MCPServerConfig,
  SSEServerConfig,
  StdioServerConfig,
  StreamableHttpServerConfig,
} from "./types.js";

interface TransportFactory {
  create(config: MCPServerConfig): Promise<Transport>;
}

function headersToOptions(headers?: Record<string, string>) {
  return headers ? { requestInit: { headers } } : undefined;
}

class StdioTransportFactory implements TransportFactory {
  async create(config: StdioServerConfig): Promise<Transport> {
    if (!config.command)
      throw new Error("Command is required for stdio transport");
    return new StdioClientTransport({
      command: resolveCommand(config.command),
      args: resolveArgs(config.args || []),
      env: mergeEnvironment(config.env || {}),
    });
  }
}

class SSETransportFactory implements TransportFactory {
  async create(config: SSEServerConfig): Promise<Transport> {
    if (!config.url) throw new Error("URL is required for SSE transport");
    return new SSEClientTransport(
      new URL(config.url),
      headersToOptions(config.headers),
    );
  }
}

class StreamableHttpTransportFactory implements TransportFactory {
  async create(config: StreamableHttpServerConfig): Promise<Transport> {
    if (!config.url)
      throw new Error("URL is required for Streamable HTTP transport");
    return new StreamableHTTPClientTransport(
      new URL(config.url),
      headersToOptions(config.headers),
    );
  }
}

const factories: Record<string, TransportFactory> = {
  [TRANSPORT_TYPES.STDIO]: new StdioTransportFactory(),
  [TRANSPORT_TYPES.SSE]: new SSETransportFactory(),
  [TRANSPORT_TYPES.STREAMABLE_HTTP]: new StreamableHttpTransportFactory(),
};

export async function createTransport(
  config: MCPServerConfig,
): Promise<Transport> {
  const factory = factories[config.type];
  if (!factory) {
    throw new Error(
      `${ERROR_MESSAGES.UNSUPPORTED_TRANSPORT_TYPE}: ${config.type}`,
    );
  }
  return factory.create(config);
}
