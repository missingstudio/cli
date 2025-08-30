import { generateText, type CoreMessage } from "ai";
import type { ToolDefinition } from "../tools/types.js";
import type { Dispatch, SetStateAction } from "react";

import { providerEnvVar } from "./constants.js";
import type { Message, Provider } from "./types.js";
import { ProviderFactory } from "./providers.js";

// Enum-like MODEL_TYPES for factory selection
export const MODEL_TYPES = {
  OPENAI: "openai",
  GOOGLE: "google",
  ANTHROPIC: "anthropic",
  GROQ: "groq",
} as const;

export class AIAgent {
  private provider: Provider;
  private model: string;
  private conversation: CoreMessage[] = [];
  private apiKey: string | undefined;

  constructor(
    provider: Provider,
    model: string,
    private tools: ToolDefinition[],
    private setIsProcessing: Dispatch<SetStateAction<boolean>>,
    private setMessages: Dispatch<SetStateAction<Message[]>>,
  ) {
    this.provider = provider;
    this.model = model;

    const envVarName = providerEnvVar[this.provider as string];
    this.apiKey = envVarName ? process.env[envVarName] : undefined;
  }

  async processMessage(userInput: string): Promise<void> {
    this.setIsProcessing(true);

    // Track conversation for context
    this.conversation.push({ role: "user", content: userInput });

    try {
      const model = this.createModel();
      if (!model) {
        throw new Error(
          `Missing API key for provider: ${this.provider}. Set ${providerEnvVar[this.provider]}`,
        );
      }

      const { text } = await generateText({
        model,
        messages: this.conversation,
      });

      // Append assistant message to conversation and UI
      this.conversation.push({ role: "assistant", content: text });
      this.setMessages((prev) => [
        ...prev,
        { role: "assistant", content: text, timestamp: new Date() },
      ]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.setMessages((prev) => [
        ...prev,
        { role: "system", content: `❌ Error: ${msg}`, timestamp: new Date() },
      ]);
    } finally {
      this.setIsProcessing(false);
    }
  }

  private createModel() {
    return ProviderFactory.create(this.provider, this.model, this.apiKey);
  }
}
