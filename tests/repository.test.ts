import { describe, test, expect } from "bun:test";
import { processRepo } from "../services/repository";

describe("processRepo", () => {
  test("processes repository and returns files with content", async () => {
    const result = await processRepo(
      "https://github.com/GaneshDeshmane/llm-orchestrator"
    );

    console.log("Total files:", result.files.length);
    console.log("First file:", result.files[0]);

    expect(result.files.length).toBeGreaterThan(0);
        console.log("DATABASE:", process.env.DATABASE_URL)
    for (const file of result.files) {
      console.log(file.path, "content length:", file.content.length);

      expect(file.path).toBeDefined();
      expect(file.content).toBeDefined();
      expect(file.size).toBeDefined();
    }
  });
});