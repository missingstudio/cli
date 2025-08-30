import { useEffect, useState } from "react";
import type { Row, Summary } from "./types.js";
import { loadMCPConfig } from "../../mcp/config.js";
import { getMCPClientManager } from "../../mcp/manager.js";
import { createLogger } from "../../logger/index.js";

export function useMCPServers(verbose: boolean) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary>({
    connected: 0,
    failed: 0,
    disabled: 0,
    total: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const logger = createLogger({ silent: !verbose, level: "info" });
        const config = loadMCPConfig();

        const manager = getMCPClientManager();
        manager.setLogger(logger);

        const servers = Object.entries(config.servers || {});

        if (servers.length === 0) return;
        setSummary((s) => ({ ...s, total: servers.length }));

        await manager.initializeFromConfig(config.servers);
        const failed = manager.getFailedConnections();
        const clients = manager.getClients();

        let connectedCount = 0;
        let failedCount = 0;
        let disabledCount = 0;

        const builtRows: Row[] = [];

        for (const [name, serverConfig] of servers) {
          const enabled = serverConfig.enabled !== false;
          const transport = serverConfig.type || "stdio";
          const client = clients.get(name);
          const failureMsg = failed[name];
          const isConnected = Boolean(client && client.connectionState);

          let statusText = "Not connected";
          if (!enabled) {
            statusText = "Disabled";
            disabledCount++;
          } else if (failureMsg) {
            statusText = "Error";
            failedCount++;
          } else if (isConnected) {
            statusText = "Connected";
            connectedCount++;
          }

          let tools = "—";
          if (enabled && isConnected && client) {
            try {
              const toolSet = await client.getTools();
              tools = String(Object.keys(toolSet).length);
            } catch {
              tools = "tools error";
            }
          }

          builtRows.push({
            name,
            type: transport,
            status: statusText,
            tools,
            error: failureMsg,
          });
        }

        setRows(builtRows);
        setSummary({
          connected: connectedCount,
          failed: failedCount,
          disabled: disabledCount,
          total: servers.length,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
        const mgr = getMCPClientManager();
        await mgr.disconnectAll();
      }
    })();
  }, []);

  return { loading, rows, summary, error };
}
