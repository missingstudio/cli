import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import boxen from "boxen";
import dedent from "dedent";

type ApiKeyPromptProps = {
  provider: string;
  model: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
};

export function ApiKeyPrompt({
  provider,
  model,
  value,
  onChange,
  onSubmit,
}: ApiKeyPromptProps) {
  return (
    <>
      <Box justifyContent="flex-start" marginBottom={2}>
        <Text color="white">
          {boxen(
            dedent`
              🔑 API Key Required

              To connect with ${provider} and enable chat, please enter your API key.
              The key should have the necessary permissions for ${model}.

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
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            placeholder="Paste your API key and press Enter"
            focus
            mask="*"
          />
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Press Enter to submit, or Ctrl+C to quit.</Text>
        </Box>
      </Box>
    </>
  );
}
