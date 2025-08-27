import { Box, Text } from "ink";
import { AsciiLogo } from "../components/ascii-logo.js";

export default function App() {
  return (
    <Box flexDirection="column">
      <Box flexDirection="column" flexGrow={1}>
        <Box flexDirection="column">
          <AsciiLogo />
          <Text color="gray">Welcome to missing studio!</Text>
        </Box>
      </Box>
    </Box>
  );
}
