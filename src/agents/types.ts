export type Provider = "openai" | "google" | "anthropic" | "groq";
export type Message = {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  timestamp: Date;
  toolName?: string;
};
