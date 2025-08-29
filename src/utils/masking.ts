const SENSITIVE_KEYS = [
  "apiKey",
  "password",
  "secret",
  "token",
  "auth",
  "key",
  "credential",
];

export const redactSensitiveData = (
  message: string,
  keys: string[] = SENSITIVE_KEYS,
): string => {
  const maskRegex = new RegExp(
    `(${keys.join("|")})(["']?\\s*[:=]\\s*)(["'])?.*?\\3`,
    "gi",
  );

  return message.replace(maskRegex, (match, key, separator, quote) => {
    const quoteMark = quote || "";
    return `${key}${separator}${quoteMark}***REDACTED***${quoteMark}`;
  });
};
