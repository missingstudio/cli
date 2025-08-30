import { Box, Text } from "ink";
import TextInput from "ink-text-input";

type InputBoxProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
};

export function InputBox({ value, onChange, onSubmit }: InputBoxProps) {
  return (
    <Box borderStyle="round" borderColor="gray" paddingLeft={1}>
      <Text color="white">{`> `} </Text>
      <TextInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder="Try some command (help, clear, exit, or describe what you want to do)"
        focus
      />
    </Box>
  );
}
