import { Box, Text } from "ink";
import { StatusMessage } from "@inkjs/ui";
import type { Summary } from "./types.js";

export function MCPSummary({
  summary,
  verbose,
}: {
  summary: Summary;
  verbose: boolean;
}) {
  const items = [
    {
      label: "connected",
      value: summary.connected,
      variant: "success" as const,
    },
    { label: "failed", value: summary.failed, variant: "error" as const },
    { label: "disabled", value: summary.disabled, variant: "warning" as const },
  ];

  return (
    <Box marginTop={1}>
      <Text bold>Summary: &nbsp;</Text>
      <Box display="flex" gap={2} flexWrap="wrap">
        {items.map((item) => (
          <StatusMessage key={item.label} variant={item.variant}>
            {`${item.value} ${item.label}`}
          </StatusMessage>
        ))}
        {verbose && (
          <StatusMessage variant="info">{`${summary.total} total`}</StatusMessage>
        )}
      </Box>
    </Box>
  );
}

export default MCPSummary;
