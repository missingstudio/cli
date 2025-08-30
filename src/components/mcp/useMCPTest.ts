import { useEffect, useState } from "react";
import type { Phase, Tool } from "./types.js";
import { loadMCPConfig } from "../../mcp/config.js";
import { getMCPClientManager } from "../../mcp/manager.js";
import { getDefaultConfigPath } from "../../config/manager.js";
import type { MCPServerConfig, IMCPClient } from "../../mcp/types.js";

/**
 * Small, focused helpers for modularity and readability
 */
function getServerConfigOrThrow(name: string): MCPServerConfig {
  const config = loadMCPConfig();
  const serverConfig = config.servers?.[name];
  if (!serverConfig) {
    throw new Error(
      `Server ${name} not found. Check: ${getDefaultConfigPath()}`,
    );
  }
  return serverConfig;
}

function getTransport(serverConfig: MCPServerConfig) {
  return serverConfig.type || "stdio";
}

async function connectAndGetClient(
  name: string,
  serverConfig: MCPServerConfig,
) {
  const manager = getMCPClientManager();
  await manager.addServer(name, serverConfig);
  const client = manager.getClients().get(name);
  if (!client || !client.connectionState) {
    throw new Error("Client did not report a connected status");
  }
  return client;
}

async function fetchClientTools(client: IMCPClient): Promise<Tool[]> {
  const toolSet = await client.getTools();
  return Object.entries(toolSet).map(([t, meta]: [string, any]) => ({
    name: t,
    description: meta?.description,
  }));
}

export function useMCPTest(name: string) {
  const [phase, setPhase] = useState<Phase>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<string>("");
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    (async () => {
      setError(null);
      setPhase("connecting");

      try {
        // 1) Load and validate config for the requested server
        const serverConfig = getServerConfigOrThrow(name);

        // 2) Resolve transport and expose early for UI
        const resolvedTransport = getTransport(serverConfig);
        setTransport(resolvedTransport);

        // 3) Connect and verify client
        const client = await connectAndGetClient(name, serverConfig);

        // 4) Fetch tools from connected client
        setPhase("tools");
        const fetchedTools = await fetchClientTools(client);
        setTools(fetchedTools);

        // 5) Done
        setPhase("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
      } finally {
        // We disconnect after gathering data to keep the test
        // output deterministic and avoid lingering processes.
        await getMCPClientManager().disconnectAll();
      }
    })();
  }, [name]);

  return { phase, error, transport, tools };
}
