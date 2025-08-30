import { Box, Text } from "ink";
import { getDefaultConfigPath } from "../../config/manager.js";

export function MCPError({ message }: { message: string }) {
  return (
    <Box flexDirection="column">
      <Text color="red">✖ Error: {message}</Text>
      <Text color="gray">Check your MCP config: {getDefaultConfigPath()}</Text>
    </Box>
  );
}

export default MCPError;
