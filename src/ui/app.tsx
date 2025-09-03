import { useApp, useInput } from "ink";
import { useMemo, useState } from "react";
import AppLayout from "./layout.js";
import { Header } from "../components/interactive/header.js";
import { Messages } from "../components/interactive/messages.js";
import { ItemSelection } from "../components/interactive/item-selection.js";
import { ApiKeyPrompt } from "../components/interactive/api-key-prompt.js";
import { InputBox } from "../components/interactive/input-box.js";
import { StatusBar } from "../components/interactive/status-bar.js";
import { providers, providerModels } from "../agents/constants.js";
import type { Message, Provider } from "../agents/types.js";
import { useGlobalShortcuts } from "../hooks/use-global-shortcuts.js";
import { useProviderModel } from "../hooks/use-provider-model.js";
import { useApiKey } from "../hooks/use-api-key.js";
import { useAgentChat } from "../hooks/use-agent-chat.js";
import { useScroll } from "../hooks/use-scroll.js";

type AppProps = {
  provider?: Provider;
  model?: string;
};

const optionItems = [
  { label: "go back", value: "back" },
  { label: "exit", value: "exit" },
];

const viewportSize = 8; // number of messages to show at once

export default function App({ provider, model }: AppProps) {
  const {
    selectedProvider,
    selectedModel,
    handleProviderSelection,
    handleModelSelection,
  } = useProviderModel({ provider, model });

  const {
    apiKeyConfigured,
    hasApiKey,
    readyForApi,
    apiKeyInput,
    setApiKeyInput,
    handleApiKeySubmit,
  } = useApiKey(selectedProvider);

  const { isProcessing, messages, setMessages, agent, messageCount } =
    useAgentChat({
      provider: selectedProvider,
      model: selectedModel,
      enabled: Boolean(selectedProvider && selectedModel && readyForApi),
    });

  const [currentInput, setCurrentInput] = useState<string>("");
  const [showHelp, setShowHelp] = useState(false);
  const { exit } = useApp();

  useGlobalShortcuts({
    onExit: exit,
    onToggleHelp: () => setShowHelp((v) => !v),
  });

  const { setScrollOffset, recentMessages } = useScroll(messages, viewportSize);

  useInput((inputKey, key) => {
    if (!selectedProvider || !selectedModel) return;
    if (!readyForApi) return;

    if (key.upArrow) {
      setScrollOffset((s) =>
        Math.min(s + 1, Math.max(messages.length - viewportSize, 0)),
      );
    } else if (key.downArrow) {
      setScrollOffset((s) => Math.max(s - 1, 0));
    } else if (key.pageUp) {
      setScrollOffset((s) =>
        Math.min(s + viewportSize, Math.max(messages.length - viewportSize, 0)),
      );
    } else if (key.pageDown) {
      setScrollOffset((s) => Math.max(s - viewportSize, 0));
    }
  });

  const lastTimeLabel = useMemo(() => {
    const last = recentMessages[recentMessages.length - 1]?.timestamp;
    return last ? ` Last: ${last.toLocaleTimeString()}` : " No activity";
  }, [recentMessages]);

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isProcessing) return;

    const trimmedValue = trimmed.toLowerCase();
    if (
      trimmedValue === "exit" ||
      trimmedValue === "quit" ||
      trimmedValue === "q"
    ) {
      setCurrentInput("");
      exit();

      return;
    }

    if (trimmedValue === "clear" || trimmedValue === "cls") {
      setMessages([
        {
          role: "assistant",
          content: "🧹 Chat history cleared!",
          timestamp: new Date(),
        },
      ]);
      setCurrentInput("");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: value,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    agent?.processMessage(value);
    setCurrentInput("");
    setScrollOffset(0);
  };

  if (!selectedProvider) {
    return (
      <AppLayout>
        <ItemSelection
          title="A provider, you must choose:"
          items={[...providers, { label: "exit", value: "exit" }] as any}
          onSelect={handleProviderSelection as any}
        />
      </AppLayout>
    );
  }

  if (selectedProvider && !selectedModel) {
    const models = providerModels[selectedProvider] || [];
    return (
      <AppLayout>
        <ItemSelection
          title={`Select a model for ${selectedProvider}:`}
          items={[...models, ...optionItems]}
          onSelect={handleModelSelection}
        />
      </AppLayout>
    );
  }

  if (selectedProvider && selectedModel && !hasApiKey && !apiKeyConfigured) {
    return (
      <AppLayout>
        <ApiKeyPrompt
          provider={String(selectedProvider)}
          model={String(selectedModel)}
          value={apiKeyInput}
          onChange={setApiKeyInput}
          onSubmit={handleApiKeySubmit}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header provider={selectedProvider} model={selectedModel} />
      <Messages messages={recentMessages} isProcessing={isProcessing} />
      <InputBox
        value={currentInput}
        onChange={setCurrentInput}
        onSubmit={handleSubmit}
      />
      <StatusBar
        messageCount={messages.length}
        isProcessing={isProcessing}
        lastTimeLabel={lastTimeLabel}
      />
    </AppLayout>
  );
}
