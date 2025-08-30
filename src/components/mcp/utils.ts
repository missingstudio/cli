const STATUS_ICONS: Record<string, string> = {
  Connected: "✓",
  Error: "✖",
  Disabled: "⚠",
  "Not connected": "•",
};

export function getStatusColor(status: string): string | undefined {
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

export function getStatusIcon(status: string): string {
  return STATUS_ICONS[status] ?? "•";
}
