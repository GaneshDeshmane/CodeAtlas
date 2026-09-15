import { describe, test, expect } from "bun:test";
import { fileContent } from "../services/github";

describe("GitHub file content", () => {

  test("gets root file content", async () => {
    const result = await fileContent(
      "GaneshDeshmane",
      "llm-orchestrator",
      "main",
      "README.md"
    );

    console.log("README:", result);

    expect(result.path).toBe("README.md");
    expect(result.content.length).toBeGreaterThan(0);
  });

  test("gets nested file content", async () => {
    const result = await fileContent(
      "GaneshDeshmane",
      "llm-orchestrator",
      "main",
      "Backend/CLAUDE.md"
    );

    console.log("Nested file:", result);

    expect(result.path).toBe("Backend/CLAUDE.md");
    expect(result.content.length).toBeGreaterThan(0);
  });

});