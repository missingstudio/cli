import { useMemo, useState } from "react";
import type { Message } from "../agents/types.js";

export function useScroll(
  messages: ReadonlyArray<Message>,
  viewportSize: number,
) {
  const [scrollOffset, setScrollOffset] = useState(0);

  const recentMessages = useMemo(() => {
    const startIndex = Math.max(
      messages.length - viewportSize - scrollOffset,
      0,
    );
    const endIndex = Math.max(messages.length - scrollOffset, 0);
    return messages.slice(startIndex, endIndex);
  }, [messages, viewportSize, scrollOffset]);

  return { scrollOffset, setScrollOffset, recentMessages } as const;
}
