import { Box, Text } from "ink";
import { AsciiLogo } from "../components/ascii-logo.js";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box flexDirection="column" minHeight={24} padding={1}>
      <Box justifyContent="flex-start" marginBottom={1}>
        <AsciiLogo />
      </Box>
      <Box flexGrow={1} flexDirection="column">
        {children}
      </Box>
    </Box>
  );
}
