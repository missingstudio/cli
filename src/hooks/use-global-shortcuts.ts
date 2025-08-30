import { useInput } from "ink";

type Options = {
  onExit: () => void;
  onToggleHelp: () => void;
};

export function useGlobalShortcuts({ onExit, onToggleHelp }: Options) {
  useInput((input, key) => {
    if (key.ctrl && input === "c") onExit();
    if (key.ctrl && input === "h") onToggleHelp();
  });
}
