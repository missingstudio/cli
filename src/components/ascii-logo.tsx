import { Box, Text } from "ink";
import Gradient from "ink-gradient";

export const AsciiMCPCli = `
███╗   ███╗███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
████╗ ████║██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
██╔████╔██║███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
██║╚██╔╝██║╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
██║ ╚═╝ ██║███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
╚═╝     ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 

From Missing Studio(https://www.missing.studio)
`;

export const AsciiLogo: React.FC = () => {
  return (
    <Box marginBottom={1} alignItems="flex-start" flexShrink={0}>
      <Gradient name="vice">
        <Text>{AsciiMCPCli}</Text>
      </Gradient>
    </Box>
  );
};
