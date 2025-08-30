import { Box, Text } from "ink";
import type { Row } from "./types.js";
import { MCPRow } from "./mcp-row.js";

export function MCPTable({
  rows,
  widths,
}: {
  rows: Row[];
  widths: { nameW: number; typeW: number };
}) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color="gray">
          {"Name".padEnd(widths.nameW)} {"Type".padEnd(widths.typeW)} Status
          {"  "}Tools
        </Text>
      </Box>
      <Box>
        <Text color="gray">
          {"─".repeat(widths.nameW)} {"─".repeat(widths.typeW)} {"─".repeat(12)}{" "}
          {"─".repeat(5)}
        </Text>
      </Box>
      {rows.map((r) => (
        <MCPRow key={r.name} row={r} widths={widths} />
      ))}
    </Box>
  );
}

export default MCPTable;
