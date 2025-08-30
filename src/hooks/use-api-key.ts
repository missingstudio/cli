import { useEffect, useMemo, useState, useCallback } from "react";
import type { Provider } from "../agents/types.js";
import { providerEnvVar } from "../agents/constants.js";

export function useApiKey(selectedProvider?: Provider) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  const envVarName = useMemo(() => {
    return selectedProvider ? providerEnvVar[selectedProvider] : undefined;
  }, [selectedProvider]);

  const hasApiKey = useMemo(() => {
    if (!envVarName) return false;
    return Boolean(process.env[envVarName]);
  }, [envVarName]);

  useEffect(() => {
    if (hasApiKey && !apiKeyConfigured) setApiKeyConfigured(true);
  }, [hasApiKey, apiKeyConfigured]);

  const handleApiKeySubmit = useCallback(
    (value: string) => {
      if (!envVarName) return;
      process.env[envVarName] = value.trim();
      setApiKeyConfigured(true);
    },
    [envVarName],
  );

  const readyForApi = hasApiKey || apiKeyConfigured;

  return {
    envVarName,
    apiKeyInput,
    setApiKeyInput,
    apiKeyConfigured,
    hasApiKey,
    readyForApi,
    handleApiKeySubmit,
  } as const;
}
