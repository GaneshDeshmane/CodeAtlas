// test-chunk.ts

import { chuncking } from "./services/chunker";

const repository =
  "https://github.com/GaneshDeshmane/llm-orchestrator";

async function testChunking() {
  try {
    console.log("=== Testing Chunking ===");

    const chunks = await chuncking(repository);

    console.log("Total chunks:", chunks.length);

    if (!Array.isArray(chunks)) {
      throw new Error("Chunking result is not an array");
    }

    if (chunks.length === 0) {
      throw new Error("No chunks found");
    }

    console.log("\nFirst 5 chunks:");
    console.dir(chunks.slice(0, 5), {
      depth: null,
    });

    const firstChunk = chunks[0];

    console.log("\nFirst chunk:");
    console.log("Path:", firstChunk?.path);
    console.log("Content:", firstChunk?.chunk);
    console.log("Chunk size:", firstChunk?.chunk?.length);

    console.log("\n=== Validation ===");

    const isArray = Array.isArray(chunks);

    const isFlat = !chunks.some((item) =>
      Array.isArray(item)
    );

    const allHavePath = chunks.every(
      (item) => Boolean(item.path)
    );

    const allHaveContent = chunks.every(
      (item) => Boolean(item.chunk)
    );

    console.log("Is array:", isArray);
    console.log("Is flat:", isFlat);
    console.log("All chunks have path:", allHavePath);
    console.log("All chunks have content:", allHaveContent);

    if (
      !isArray ||
      !isFlat ||
      !allHavePath ||
      !allHaveContent
    ) {
      throw new Error("Chunk validation failed");
    }

    console.log("\n=== Chunking Test Passed ===");
  } catch (error) {
    console.error("\n=== Chunking Test Failed ===");
    console.error(error);
  }
}

testChunking();