import { useCallback, useEffect, useState } from "react";
import type { Provider } from "../agents/types.js";
import { getConfigManager } from "../config/manager.js";

export function useProviderModel(initial?: {
  provider?: Provider;
  model?: string;
}) {
  const [selectedProvider, setSelectedProvider] = useState<
    Provider | undefined
  >(initial?.provider);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    initial?.model,
  );

  useEffect(() => {
    if (selectedProvider && selectedModel) {
      try {
        const manager = getConfigManager();
        manager.saveProjectSettings({
          provider: selectedProvider,
          model: selectedModel,
        });
      } catch {}
    }
  }, [selectedProvider, selectedModel]);

  const handleProviderSelection = useCallback((item: { value: Provider }) => {
    if ((item.value as any) === "exit") process.exit(0);
    setSelectedProvider(item.value);
  }, []);

  const handleModelSelection = useCallback((item: { value: string }) => {
    if (item.value === "exit") process.exit(0);
    if (item.value === "back") {
      setSelectedModel(undefined);
      setSelectedProvider(undefined);
      return;
    }

    setSelectedModel(item.value);
  }, []);

  return {
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    handleProviderSelection,
    handleModelSelection,
  } as const;
}
