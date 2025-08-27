import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import App from "./app.js";

describe("App", () => {
  it("greets provided config", () => {
    const { lastFrame } = render(<App />);
    const output = lastFrame() ?? "";
    expect(output).toContain("Welcome to missing studio");
  });
});
