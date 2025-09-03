import { Box, Text } from "ink";
import BigText from "ink-big-text";

interface BannerProps {
  text?: string;
  font?:
    | "block"
    | "simple"
    | "simpleBlock"
    | "3d"
    | "simple3d"
    | "chrome"
    | "huge";
  colors?: string[];
  align?: "left" | "center" | "right";
  showSubtitle?: boolean;
}

export const Banner = ({
  text = "Mstudio",
  font = "block",
  colors = ["white"],
  align = "left",
  showSubtitle = true,
}: BannerProps) => {
  return (
    <Box
      flexDirection="column"
      alignItems={
        align === "center"
          ? "center"
          : align === "right"
            ? "flex-end"
            : "flex-start"
      }
    >
      <BigText text={text} font={font} colors={colors} />
      {showSubtitle && (
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            Welcome to Missing Studio CLI
          </Text>
        </Box>
      )}
    </Box>
  );
};
