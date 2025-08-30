export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  function: (input: any) => Promise<string>;
}
