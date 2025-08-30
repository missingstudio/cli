import { useEffect, useMemo, useState } from "react";
import type { Message, Provider } from "../agents/types.js";
import { AIAgent } from "../agents/AIAgent.js";

export function useAgentChat(options: {
  provider?: Provider;
  model?: string;
  enabled: boolean;
}) {
  const { provider, model, enabled } = options;
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agent, setAgent] = useState<AIAgent | null>(null);

  useEffect(() => {
    if (provider && model && enabled) {
      const instance = new AIAgent(
        provider,
        model,
        [],
        setIsProcessing,
        setMessages,
      );
      setAgent(instance);
    }
  }, [provider, model, enabled]);

  const messageCount = useMemo(() => messages.length, [messages]);

  return { isProcessing, messages, setMessages, agent, messageCount } as const;
}
