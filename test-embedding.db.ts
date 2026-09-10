import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const OLLAMA_URL = "http://localhost:11434";

async function main() {
  console.log("=== Testing Chunk → Embedding → PostgreSQL ===\n");

  // 1. Create test repository
  const repository = await prisma.repository.create({
    data: {
      name: "embedding-test",
      url: `https://github.com/test/embedding-${Date.now()}`,
      owner: "test",
      path: "test-repo",
    },
  });

  console.log("Repository created:", repository.id);

  // 2. Create test file
  const file = await prisma.files.create({
    data: {
      path: "test.ts",
      fileContent: "function hello() { return 'Hello World'; }",
      repositoryId: repository.id,
    },
  });

  console.log("File created:", file.id);

  // 3. Create ONE chunk
  const chunk = await prisma.chunk.create({
    data: {
      content: file.fileContent,
      position: 0,
      filesId: file.id,
    },
  });

  console.log("Chunk created:", chunk.chunkId);

  // 4. Generate ONE embedding using Ollama
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: chunk.content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  const embedding = data.embedding;

  console.log("Embedding generated");
  console.log("Dimensions:", embedding.length);

  // 5. Validate embedding
  if (!Array.isArray(embedding)) {
    throw new Error("Embedding is not an array");
  }

  if (embedding.length !== 768) {
    throw new Error(`Expected 768 dimensions, got ${embedding.length}`);
  }

  if (!embedding.every((value: unknown) => typeof value === "number")) {
    throw new Error("Embedding contains non-number values");
  }

  console.log("Embedding validation: PASSED\n");

  // 6. Insert vector into PostgreSQL
  const vectorString = `[${embedding.join(",")}]`;

  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO "embedding"
      ("data", "chunkId", "createdAt", "updatedAt")
    VALUES
      (${vectorString}::vector, ${chunk.chunkId}, ${now}, ${now})
  `;

  console.log("Vector inserted into PostgreSQL: ✓");

  // 7. Retrieve the vector
  const result = await prisma.$queryRaw<
    {
      embeddingId: number;
      chunkId: number;
      data: string;
    }[]
  >`
    SELECT
      "embeddingId",
      "chunkId",
      "data"::text AS data
    FROM "embedding"
    WHERE "chunkId" = ${chunk.chunkId}
  `;

  if (result.length !== 1) {
    throw new Error("Embedding was not retrieved");
  }

  const retrieved = result[0];

  console.log("Vector retrieved: ✓");
  console.log("Embedding ID:", retrieved.embeddingId);
  console.log("Chunk ID:", retrieved.chunkId);
  console.log("Vector exists:", !!retrieved.data);

  // 8. Verify chunk relationship
  if (retrieved.chunkId !== chunk.chunkId) {
    throw new Error("Retrieved embedding belongs to the wrong chunk");
  }

  // 9. Verify vector has 768 dimensions
  const retrievedVector = retrieved.data
    .replace("[", "")
    .replace("]", "")
    .split(",")
    .map(Number);

  console.log("Retrieved dimensions:", retrievedVector.length);

  if (retrievedVector.length !== 768) {
    throw new Error(
      `Expected retrieved vector to have 768 dimensions, got ${retrievedVector.length}`
    );
  }

  console.log("Retrieved vector validation: PASSED");

  console.log("\n=== Embedding Database Test Passed === ✓");

  // 10. Cleanup
  await prisma.embedding.delete({
    where: {
      chunkId: chunk.chunkId,
    },
  });

  await prisma.chunk.delete({
    where: {
      chunkId: chunk.chunkId,
    },
  });

  await prisma.files.delete({
    where: {
      id: file.id,
    },
  });

  await prisma.repository.delete({
    where: {
      id: repository.id,
    },
  });

  console.log("Test data cleaned up.");
}

main()
  .catch((error) => {
    console.error("\n=== Embedding Database Test Failed ===");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });