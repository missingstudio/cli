import { Box, Text } from "ink";
import { Spinner } from "@inkjs/ui";
import { StatusMessage } from "@inkjs/ui";
import type { Row, Summary, Tool } from "./types.js";
import { getDefaultConfigPath } from "../../config/manager.js";

const STATUS_ICONS: Record<string, string> = {
  Connected: "✓",
  Error: "✖",
  Disabled: "⚠",
  "Not connected": "•",
};

function getStatusColor(status: string): string | undefined {
  switch (status) {
    case "Connected":
      return "green";
    case "Error":
      return "red";
    case "Disabled":
      return "yellow";
    default:
      return "gray";
  }
}

function getStatusIcon(status: string): string {
  return STATUS_ICONS[status] ?? "•";
}

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

export function MCPError({ message }: { message: string }) {
  return (
    <Box flexDirection="column">
      <Text color="red">✖ Error: {message}</Text>
      <Text color="gray">Check your MCP config: {getDefaultConfigPath()}</Text>
    </Box>
  );
}

export function MCPEmpty() {
  return (
    <Box flexDirection="column">
      <Text color="yellow">No MCP servers configured.</Text>
      <Text color="gray">Add servers in: {getDefaultConfigPath()}</Text>
    </Box>
  );
}

export function ConnectingState({
  name,
  transport,
}: {
  name: string;
  transport: string;
}) {
  return <Spinner label={`Connecting to ${name} via ${transport || "…"}…`} />;
}

export function ToolsLoadingState({ name }: { name: string }) {
  return <Spinner label={`Fetching tools from ${name}…`} />;
}

export function ErrorState({ error }: { error: string | null }) {
  return (
    <Box flexDirection="column">
      <Text color="red">Failed: {error}</Text>
    </Box>
  );
}

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
