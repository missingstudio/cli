import { Box, Text } from "ink";
import type { Row } from "./types.js";
import { getStatusColor, getStatusIcon } from "./utils.js";

export function MCPRow({
  row,
  widths,
}: {
  row: Row;
  widths: { nameW: number; typeW: number };
}) {
  return (
    <Box flexDirection="column">
      <Box>
        <Text>
          {row.name.padEnd(widths.nameW)} {row.type.padEnd(widths.typeW)}{" "}
        </Text>
        <Text color={getStatusColor(row.status)}>
          {getStatusIcon(row.status)} {row.status.padEnd(12)}
        </Text>
        <Text> {row.tools}</Text>
      </Box>
      {row.error ? <Text color="red"> ↳ {row.error}</Text> : null}
    </Box>
  );
}

export default MCPRow;
