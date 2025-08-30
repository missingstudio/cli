export const providers = [
  { label: "anthropic", value: "anthropic" },
  { label: "google", value: "google" },
  { label: "openAI", value: "openai" },
  { label: "groq", value: "groq" },
];

// Static model lists per provider (can be extended later)
export const providerModels: Record<
  string,
  { label: string; value: string }[]
> = {
  openai: [
    { label: "gpt-4o", value: "gpt-4o" },
    { label: "gpt-4o-mini", value: "gpt-4o-mini" },
    { label: "gpt-4.1-mini", value: "gpt-4.1-mini" },
    { label: "o3-mini", value: "o3-mini" },
  ],
  anthropic: [
    { label: "claude-3-5-sonnet", value: "claude-3-5-sonnet-20240620" },
    { label: "claude-3-opus", value: "claude-3-opus-20240229" },
    { label: "claude-3-haiku", value: "claude-3-haiku-20240307" },
  ],
  google: [
    { label: "gemini-1.5-pro", value: "gemini-1.5-pro" },
    { label: "gemini-1.5-flash", value: "gemini-1.5-flash" },
  ],
  groq: [
    { label: "llama-3.1-70b-versatile", value: "llama-3.1-70b-versatile" },
    { label: "llama-3.1-8b-instant", value: "llama-3.1-8b-instant" },
    { label: "mixtral-8x7b-32768", value: "mixtral-8x7b-32768" },
  ],
};

// Required API env var per provider
export const providerEnvVar: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  groq: "GROQ_API_KEY",
};
