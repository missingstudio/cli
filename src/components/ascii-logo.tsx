import { Box, Text } from "ink";
import Gradient from "ink-gradient";
import { memo } from "react";

export const asciiMcpCli = `
███╗   ███╗███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
████╗ ████║██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
██╔████╔██║███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
██║╚██╔╝██║╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
██║ ╚═╝ ██║███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
╚═╝     ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 

From Missing Studio(https://www.missing.studio)
`;

export const AsciiLogo = memo(() => {
  return (
    <Box marginBottom={1} alignItems="flex-start" flexShrink={0}>
      <Gradient name="vice">
        <Text>{asciiMcpCli}</Text>
      </Gradient>
    </Box>
  );
});
