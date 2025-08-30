import { Box } from "ink";
import { Spinner } from "@inkjs/ui";

import { useMCPServers } from "../components/mcp/use-mcp-servers.js";
import MCPEmpty from "../components/mcp/mcp-empty.js";
import MCPError from "../components/mcp/mcp-error.js";
import Table from "../components/ink-table.js";
import MCPSummary from "../components/mcp/mcp-summary.js";

export function MCPList({ verbose = false }: { verbose?: boolean }) {
  const { loading, rows, summary, error } = useMCPServers(verbose);

  if (loading) return <Spinner label="Checking MCP server health…" />;
  if (rows.length === 0) return <MCPEmpty />;
  if (error) return <MCPError message={error} />;

  return (
    <Box flexDirection="column">
      <Table data={rows} maxCellWidth={45} />
      <MCPSummary summary={summary} verbose={Boolean(verbose)} />
    </Box>
  );
}

export default MCPList;
