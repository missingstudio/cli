import { Box, Text } from "ink";
import type { Tool } from "./types.js";

export function SuccessState({
  name,
  transport,
  tools,
}: {
  name: string;
  transport: string;
  tools: Tool[];
}) {
  return (
    <Box flexDirection="column">
      <Text color="green">✓ Connected to {name}</Text>
      <Text color="gray">
        Transport: <Text color="cyan">{transport}</Text>
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text>Available tools: {tools.length}</Text>
        {tools.map((t) => (
          <Text key={t.name}>
            • {t.name}
            {t.description ? ` — ${t.description}` : ""}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

export default SuccessState;
