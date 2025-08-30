import { Box, Text } from "ink";
import { getDefaultConfigPath } from "../../config/manager.js";

export function MCPEmpty() {
  return (
    <Box flexDirection="column">
      <Text color="yellow">No MCP servers configured.</Text>
      <Text color="gray">Add servers in: {getDefaultConfigPath()}</Text>
    </Box>
  );
}

export default MCPEmpty;
