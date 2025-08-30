import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { memo } from "react";
import type { Message } from "../../agents/types.js";

type MessagesProps = {
  messages: ReadonlyArray<Message>;
  isProcessing: boolean;
};

export const Messages = memo(({ messages, isProcessing }: MessagesProps) => {
  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      marginTop={1}
      marginBottom={1}
      minHeight={12}
    >
      {messages.length === 0 && (
        <Text color="gray" dimColor>
          No messages yet. Say hi below!
        </Text>
      )}

      {messages.map((msg, index) => (
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
                  ? `[${msg.toolName}] ${msg.content
                      .replace(`Executing ${msg.toolName}...`, "")
                      .replace(/^\(.*\)\.\.\./, "")}`
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
      ))}

      {isProcessing && (
        <Box marginBottom={1} gap={1}>
          <Text color="green">
            <Spinner type="star" />
          </Text>
          <Text>Working...</Text>
        </Box>
      )}
    </Box>
  );
});
