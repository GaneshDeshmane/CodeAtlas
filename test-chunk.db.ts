import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const OLLAMA_URL = "http://localhost:11434";

async function generateEmbedding(text: string) {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.embedding)) {
    throw new Error("Embedding is not an array");
  }

  if (data.embedding.length !== 768) {
    throw new Error(
      `Expected 768 dimensions, got ${data.embedding.length}`
    );
  }

  return data.embedding as number[];
}

async function main() {
  console.log("=== Testing pgvector Similarity Search ===\n");

  // 1. Create test repository
  const repository = await prisma.repository.create({
    data: {
      name: "similarity-test",
      url: `https://github.com/test/similarity-${Date.now()}`,
      owner: "test",
      path: "similarity-test",
    },
  });

  console.log("Repository created:", repository.id);

  // 2. Create test file
  const file = await prisma.files.create({
    data: {
      path: "test.ts",
      fileContent: `
        function loginUser(username: string, password: string) {
          // authenticate user
        }

        function calculateSum(a: number, b: number) {
          return a + b;
        }

        function sendEmail(to: string, message: string) {
          // send email
        }
      `,
      repositoryId: repository.id,
    },
  });

  console.log("File created:", file.id);

  // 3. Create test chunks
  const chunks = [
    {
      content:
        "The loginUser function authenticates a user using their username and password.",
      position: 0,
    },
    {
      content:
        "The calculateSum function takes two numbers and returns their sum.",
      position: 1,
    },
    {
      content:
        "The sendEmail function sends an email message to a specified recipient.",
      position: 2,
    },
  ];

  const createdChunks = [];

  for (const item of chunks) {
    const chunk = await prisma.chunk.create({
      data: {
        content: item.content,
        position: item.position,
        filesId: file.id,
      },
    });

    createdChunks.push(chunk);
  }

  console.log("Chunks created:", createdChunks.length);

  // 4. Generate and store embeddings
  for (const chunk of createdChunks) {
    console.log(`Generating embedding for chunk ${chunk.chunkId}...`);

    const embedding = await generateEmbedding(chunk.content);

    const vectorString = `[${embedding.join(",")}]`;

    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO "embedding"
        ("data", "chunkId", "createdAt", "updatedAt")
      VALUES
        (${vectorString}::vector, ${chunk.chunkId}, ${now}, ${now})
    `;
  }

  console.log("\nAll chunk embeddings stored: ✓");

  // 5. Create query
  const query =
    "Where is the code that handles user authentication and login?";

  console.log("\nQuery:");
  console.log(query);

  // 6. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  console.log("\nQuery embedding generated: ✓");
  console.log("Dimensions:", queryEmbedding.length);

  // 7. Convert query embedding to pgvector
  const queryVector = `[${queryEmbedding.join(",")}]`;

  // 8. Perform cosine similarity search
  const results = await prisma.$queryRaw<
    {
      chunkId: number;
      content: string;
      position: number;
      similarity: number;
    }[]
  >`
    SELECT
      c."chunkId",
      c."content",
      c."position",
      1 - (e."data" <=> ${queryVector}::vector) AS similarity
    FROM "embedding" e
    JOIN "chunk" c
      ON c."chunkId" = e."chunkId"
    WHERE c."filesId" = ${file.id}
    ORDER BY e."data" <=> ${queryVector}::vector
    LIMIT 3
  `;


  console.log("\n=== Similarity Search Results ===\n");

  results.forEach((result, index) => {
    console.log(`Result ${index + 1}`);
    console.log("Chunk ID:", result.chunkId);
    console.log("Position:", result.position);
    console.log("Similarity:", result.similarity);
    console.log("Content:", result.content);
    console.log("-----------------------------------");
  });

  // 10. Validate results
  if (results.length === 0) {
    throw new Error("Similarity search returned no results");
  }

  if (results[0].chunkId !== createdChunks[0].chunkId) {
    throw new Error(
      "Expected the authentication chunk to be the most relevant result"
    );
  }

  console.log("\nTop result validation: PASSED ✓");


  for (let i = 1; i < results.length; i++) {
    if (results[i].similarity > results[i - 1].similarity) {
      throw new Error("Similarity results are not ordered correctly");
    }
  }

  console.log("Similarity ordering validation: PASSED ✓");

  console.log("\n=== Similarity Search Test Passed === ✓");

  // 12. Cleanup
  await prisma.embedding.deleteMany({
    where: {
      chunkId: {
        in: createdChunks.map((chunk) => chunk.chunkId),
      },
    },
  });

  await prisma.chunk.deleteMany({
    where: {
      filesId: file.id,
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
    console.error("\n=== Similarity Search Test Failed ===");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });