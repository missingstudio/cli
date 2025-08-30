import { useMCPTest } from "./useMCPTest.js";
import {
  ConnectingState,
  ToolsLoadingState,
  ErrorState,
  SuccessState,
} from "./mcp-base.js";

export function MCPTest({ name }: { name: string }) {
  const { phase, error, transport, tools } = useMCPTest(name);

  if (phase === "connecting")
    return <ConnectingState name={name} transport={transport} />;
  if (phase === "tools") return <ToolsLoadingState name={name} />;
  if (phase === "error") return <ErrorState error={error} />;

  return <SuccessState name={name} transport={transport} tools={tools} />;
}

export default MCPTest;
