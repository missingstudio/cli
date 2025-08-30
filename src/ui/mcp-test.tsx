import { Spinner } from "@inkjs/ui";

import { useMCPTest } from "../components/mcp/use-mcp-test.js";
import ErrorState from "../components/mcp/error-state.js";
import SuccessState from "../components/mcp/success-state.js";

export function MCPTest({ name }: { name: string }) {
  const { phase, error, transport, tools } = useMCPTest(name);

  if (phase === "connecting")
    return <Spinner label={`Connecting to ${name} via ${transport || "…"}…`} />;
  if (phase === "tools")
    return <Spinner label={`Fetching tools from ${name}…`} />;
  if (phase === "error") return <ErrorState error={error} />;

  return <SuccessState name={name} transport={transport} tools={tools} />;
}

export default MCPTest;
