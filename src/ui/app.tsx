import { Box, Text, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "./layout.js";
import {
  providers,
  providerModels,
  providerEnvVar,
} from "../agents/constants.js";
import { getConfigManager } from "../config/manager.js";
import boxen from "boxen";
import { AIAgent } from "../agents/AIAgent.js";
import Spinner from "ink-spinner";
import type { Message, Provider } from "../agents/types.js";
import dedent from "dedent";

type AppProps = {
  provider?: Provider;
  model?: string;
};

const optionItems = [
  { label: "go back", value: "back" },
  { label: "exit", value: "exit" },
];

const MenuItem = ({
  isSelected = false,
  label,
}: {
  isSelected?: boolean;
  label: string;
}) => (
  <Text color={isSelected ? "yellow" : "gray"} bold={isSelected}>
    {label}
  </Text>
);

const VIEWPORT_SIZE = 8; // number of messages to show at once
export default function App({ provider, model }: AppProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<
    Provider | undefined
  >(provider);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(model);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [showHelp, setShowHelp] = useState(false);
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      exit();
    }
    if (key.ctrl && input === "h") {
      setShowHelp(!showHelp);
    }
  });

  useEffect(() => {
    if (selectedProvider && selectedModel) {
      const manager = getConfigManager();

      try {
        manager.saveProjectSettings({
          provider: selectedProvider,
          model: selectedModel,
        });
      } catch {}
    }
  }, [selectedProvider, selectedModel]);

  const envVarName = useMemo(() => {
    return selectedProvider ? providerEnvVar[selectedProvider] : undefined;
  }, [selectedProvider]);

  const hasApiKey = useMemo(() => {
    if (!envVarName) return false;
    return Boolean(process.env[envVarName]);
  }, [envVarName]);

  const readyForApi = hasApiKey || apiKeyConfigured;

  // If the key already exists in env, mark as configured so any
  // apiKeyConfigured-only checks are satisfied.
  useEffect(() => {
    if (hasApiKey && !apiKeyConfigured) {
      setApiKeyConfigured(true);
    }
  }, [hasApiKey, apiKeyConfigured]);

  const handleProviderSelection = useCallback((item: { value: Provider }) => {
    if ((item.value as any) === "exit") process.exit(0);
    setSelectedProvider(item.value);
  }, []);

  const handleModelSelection = useCallback((item: { value: string }) => {
    if (item.value === "exit") process.exit(0);
    if (item.value === "back") {
      setSelectedModel(undefined);
      setSelectedProvider(undefined);
      return;
    }

    setSelectedModel(item.value);
  }, []);

  const handleApiKeySubmit = useCallback(
    (value: string) => {
      if (!envVarName) return;
      process.env[envVarName] = value.trim();
      setApiKeyConfigured(true);
    },
    [envVarName],
  );

  useEffect(() => {
    if (selectedProvider && selectedModel && readyForApi) {
      const agentInstance = new AIAgent(
        selectedProvider,
        selectedModel,
        [],
        setIsProcessing,
        setMessages,
      );

      setAgent(agentInstance);
    }
  }, [selectedProvider, selectedModel, readyForApi]);

  useInput((inputKey, key) => {
    if (!selectedProvider || !selectedModel) return;
    if (!readyForApi) return;

    if (key.upArrow) {
      setScrollOffset((s) =>
        Math.min(s + 1, Math.max(messages.length - VIEWPORT_SIZE, 0)),
      );
    } else if (key.downArrow) {
      setScrollOffset((s) => Math.max(s - 1, 0));
    } else if (key.pageUp) {
      setScrollOffset((s) =>
        Math.min(
          s + VIEWPORT_SIZE,
          Math.max(messages.length - VIEWPORT_SIZE, 0),
        ),
      );
    } else if (key.pageDown) {
      setScrollOffset((s) => Math.max(s - VIEWPORT_SIZE, 0));
    }
  });

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
        <Box justifyContent="flex-start" marginBottom={1}>
          <Text color="gray">A provider, you must choose:</Text>
        </Box>
        <SelectInput
          items={[...providers, ...optionItems] as any}
          onSelect={handleProviderSelection}
          itemComponent={MenuItem}
          indicatorComponent={({ isSelected }) =>
            isSelected ? <Text color="yellow">👉 </Text> : <Text> </Text>
          }
        />
      </AppLayout>
    );
  }

  if (selectedProvider && !selectedModel) {
    const models = providerModels[selectedProvider] || [];
    return (
      <AppLayout>
        <Box justifyContent="flex-start" marginBottom={1}>
          <Text color="gray">Select a model for {selectedProvider}:</Text>
        </Box>
        <SelectInput
          items={[...models, ...optionItems]}
          onSelect={handleModelSelection}
          itemComponent={MenuItem}
          indicatorComponent={({ isSelected }) =>
            isSelected ? <Text color="yellow">👉 </Text> : <Text> </Text>
          }
        />
      </AppLayout>
    );
  }

  if (selectedProvider && selectedModel && !hasApiKey && !apiKeyConfigured) {
    return (
      <AppLayout>
        <Box justifyContent="flex-start" marginBottom={2}>
          <Text color="white">
            {boxen(
              dedent`
                🔑 API Key Required

                To connect with ${selectedProvider} and enable chat, please enter your API key.
                The key should have the necessary permissions for ${selectedModel}.

                👉 Paste your key below to continue.
              `,
              {
                padding: 1,
                borderColor: "yellow",
                borderStyle: "round",
                backgroundColor: "black",
                title: "Missing studio Requires",
                titleAlignment: "left",
              },
            )}
          </Text>
        </Box>

        <Box flexDirection="column" marginTop={2}>
          <Box borderStyle="round" borderColor="gray" paddingX={1}>
            <Text color={"magenta"}>{"> "}</Text>
            <TextInput
              value={apiKeyInput}
              onChange={setApiKeyInput}
              onSubmit={handleApiKeySubmit}
              placeholder="Paste your API key and press Enter"
              focus
              mask="*"
            />
          </Box>
          <Box marginTop={1}>
            <Text color="gray">Press Enter to submit, or Ctrl+C to quit.</Text>
          </Box>
        </Box>
      </AppLayout>
    );
  }

  const startIndex = Math.max(
    messages.length - VIEWPORT_SIZE - scrollOffset,
    0,
  );
  const endIndex = Math.max(messages.length - scrollOffset, 0);
  const recentMessages = messages.slice(startIndex, endIndex);

  return (
    <AppLayout>
      {/* Header */}
      <Box justifyContent="space-between" flexDirection="column" width="100%">
        <Text bold color="cyan">
          Missing studio AI Agent
        </Text>
        <Text color="gray">
          Selected Provider: {selectedProvider} | Model: {selectedModel}
        </Text>
      </Box>

      {/* Conversation History */}
      <Box
        flexDirection="column"
        flexGrow={1}
        marginTop={1}
        marginBottom={1}
        minHeight={12}
      >
        {recentMessages.length === 0 && (
          <Text color="gray" dimColor>
            No messages yet. Say hi below!
          </Text>
        )}

        {recentMessages.map((msg, index) => {
          const isLast = index === recentMessages.length - 1;
          return (
            <Box key={index} marginBottom={0}>
              {msg.role === "user" && (
                <Box marginBottom={1}>
                  <Text color="white">{`| `}</Text>
                  <Text color="gray">{msg.content}</Text>
                </Box>
              )}

              {msg.role === "assistant" && (
                <Box marginBottom={1} paddingLeft={2}>
                  <Text wrap="wrap" color="white">
                    {msg.content}
                  </Text>
                </Box>
              )}

              {msg.role === "tool" && (
                <Box marginBottom={1} paddingLeft={2}>
                  <Text color="gray" dimColor>
                    {msg.toolName && msg.content.includes("Executing")
                      ? `[${msg.toolName}] ${msg.content.replace(`Executing ${msg.toolName}...`, "").replace(/^\(.*\)\.\.\./, "")}`
                      : msg.content
                          .replace("✅", "")
                          .replace("❌ Error:", "ERROR:")
                          .trim()}
                  </Text>
                </Box>
              )}

              {msg.role === "system" && (
                <Box marginBottom={1} paddingLeft={2}>
                  <Text color="red">
                    ERROR: {msg.content.replace("❌ Error:", "").trim()}
                  </Text>
                </Box>
              )}
            </Box>
          );
        })}

        {isProcessing && (
          <Box marginBottom={1} gap={1}>
            <Text color="green">
              <Spinner type="star" />
            </Text>
            <Text>Working...</Text>
          </Box>
        )}
      </Box>

      {/* User Input */}
      <Box borderStyle="round" borderColor="gray" paddingLeft={1}>
        <Text color="white">{`> `} </Text>
        <TextInput
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={handleSubmit}
          placeholder="Try some command (help, clear, exit, or describe what you want to do)"
          focus
        />
      </Box>

      {/* Status Bar */}
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          {messages.length > 0 ? `${messages.length} messages` : "Ready"} |
          {isProcessing ? " Processing..." : " Idle"} |
          {recentMessages.length > 0 &&
          recentMessages[recentMessages.length - 1]?.timestamp
            ? ` Last: ${recentMessages[recentMessages.length - 1]?.timestamp?.toLocaleTimeString()}`
            : " No activity"}
          &nbsp;
        </Text>
        <Text color="gray">↑/↓ scroll • Ctrl+C to exit</Text>
      </Box>
    </AppLayout>
  );
}
