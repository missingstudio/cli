import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { Provider } from "./types.js";
import { MODEL_TYPES } from "./AIAgent.js";

export class ProviderFactory {
  static create(type: Provider, modelName: string, apiKey?: string) {
    if (!apiKey) return undefined;

    switch (type) {
      case MODEL_TYPES.OPENAI: {
        return createOpenAI({ apiKey })(modelName);
      }
      case MODEL_TYPES.GOOGLE: {
        const name = modelName?.startsWith("models/")
          ? modelName
          : `models/${modelName}`;
        return createGoogleGenerativeAI({ apiKey })(name);
      }
      case MODEL_TYPES.ANTHROPIC: {
        return createAnthropic({ apiKey })(modelName);
      }
      case MODEL_TYPES.GROQ: {
        return createGroq({ apiKey })(modelName);
      }
      default:
        return undefined;
    }
  }
}
