import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import App from "./app.js";

describe("App", () => {
  it("shows provider selection when no config provided", () => {
    const { lastFrame } = render(<App />);
    const output = lastFrame() ?? "";
    expect(output).toContain("A provider, you must choose:");
  });
});
