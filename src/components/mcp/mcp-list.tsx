import { Box, useApp } from "ink";
import { useEffect } from "react";
import { Spinner } from "@inkjs/ui";

import { useMCPServers } from "./useMCPServers.js";
import { MCPEmpty, MCPError, MCPSummary, MCPTable } from "./mcp-base.js";
import Table from "../ink-table.js";

export function MCPList({ verbose = false }: { verbose?: boolean }) {
  const { exit } = useApp();
  const { loading, rows, summary, error } = useMCPServers(exit);

  // After data is ready and rendered, politely exit to finalize output
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => exit(), 10);
      return () => clearTimeout(t);
    }
  }, [loading, exit]);

  if (loading) return <Spinner label="Checking MCP server health…" />;
  if (rows.length === 0) return <MCPEmpty />;
  if (error) return <MCPError message={error} />;

  return (
    <Box flexDirection="column">
      <Table data={rows} />
      <MCPSummary summary={summary} verbose={verbose} />
    </Box>
  );
}

export default MCPList;
