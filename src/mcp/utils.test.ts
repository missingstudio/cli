import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mergeEnvironment, parseKeyValue } from "./utils.js";

describe("utils.parseKeyValue", () => {
  it("parses simple key=value pairs", () => {
    const out = parseKeyValue(["A=1", "B=hello world", "C="]);
    expect(out).toEqual({ A: "1", B: "hello world", C: "" });
  });

  it("trims spaces around keys and values", () => {
    const out = parseKeyValue(["  KEY  =  value  "]);
    expect(out).toEqual({ KEY: "value" });
  });

  it("throws on invalid format", () => {
    expect(() => parseKeyValue(["NOVALUE"])).toThrowError();
    expect(() => parseKeyValue(["=missingKey"])).toThrowError();
  });
});

describe("utils.mergeEnvironment", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, FROM_ENV: "env", OVERRIDE: "old" } as any;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("merges process.env with config env, preferring config values", () => {
    const result = mergeEnvironment({ FROM_CONFIG: "cfg", OVERRIDE: "new" });
    expect(result.FROM_ENV).toBe("env");
    expect(result.FROM_CONFIG).toBe("cfg");
    expect(result.OVERRIDE).toBe("new");
  });
});
