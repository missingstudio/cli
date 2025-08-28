export type Row = {
  name: string;
  type: string;
  status: string;
  tools: string;
  error?: string;
};

export type Summary = {
  connected: number;
  failed: number;
  disabled: number;
  total: number;
};

export type Phase = "connecting" | "tools" | "done" | "error";
export type Tool = { name: string; description?: string };
