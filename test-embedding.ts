// test-embedding.ts

import { chuncking } from "./services/chunker";

const repository =
  "https://github.com/GaneshDeshmane/llm-orchestrator";

async function testEmbedding() {
  try {
    console.log("=== Testing Chunk → Embedding ===");

    const chunks = await chuncking(repository);

    console.log("Total chunks:", chunks.length);

    const firstChunk = chunks[0];

    if (!firstChunk) {
      throw new Error("No chunks found");
    }

    console.log("Path:", firstChunk.path);
    console.log("Chunk length:", firstChunk.chunk.length);

    const response = await fetch(
      "http://localhost:11434/api/embed",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nomic-embed-text",
          input: firstChunk.chunk,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Embedding request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    const embedding = data.embeddings?.[0];

    if (!embedding) {
      throw new Error("No embedding returned");
    }

    console.log("Embedding length:", embedding.length);
    console.log("First 10 values:", embedding.slice(0, 10));

    if (!Array.isArray(embedding)) {
      throw new Error("Embedding is not an array");
    }

    if (embedding.length !== 768) {
      throw new Error(
        `Expected 768 dimensions, got ${embedding.length}`
      );
    }

    if (!embedding.every((value: unknown) => typeof value === "number")) {
      throw new Error("Embedding contains non-number values");
    }

    console.log("\n=== Validation ===");
    console.log("Is array: true");
    console.log("Dimensions: 768");
    console.log("All values are numbers: true");

    console.log("\n=== Embedding Test Passed ===");
  } catch (error) {
    console.error("\n=== Embedding Test Failed ===");
    console.error(error);
  }
}

testEmbedding();