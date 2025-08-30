import { Box, Text } from "ink";
import { memo } from "react";

type StatusBarProps = {
  messageCount: number;
  isProcessing: boolean;
  lastTimeLabel: string;
};

export const StatusBar = memo(
  ({ messageCount, isProcessing, lastTimeLabel }: StatusBarProps) => {
    return (
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          {messageCount > 0 ? `${messageCount} messages` : "Ready"} |
          {isProcessing ? " Processing..." : " Idle"} |{lastTimeLabel}
          &nbsp;
        </Text>
        <Text color="gray">↑/↓ scroll • Ctrl+C to exit</Text>
      </Box>
    );
  },
);
