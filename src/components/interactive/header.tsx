import { Box, Text } from "ink";
import { memo } from "react";

type HeaderProps = {
  provider?: string;
  model?: string;
};

export const Header = memo(({ provider, model }: HeaderProps) => {
  return (
    <Box justifyContent="space-between" flexDirection="column" width="100%">
      <Text bold color="cyan">
        Missing studio AI Agent
      </Text>
      <Text color="gray">
        Selected Provider: {provider} | Model: {model}
      </Text>
    </Box>
  );
});
