import { Box, Text } from "ink";

export function ErrorState({ error }: { error: string | null }) {
  return (
    <Box flexDirection="column">
      <Text color="red">Failed: {error}</Text>
    </Box>
  );
}

export default ErrorState;
