import { test, expect, beforeAll, afterAll } from "bun:test";
import { storeRepo } from "../services/embedding";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const repositoryUrl = "https://github.com/GaneshDeshmane/llm-orchestrator";

async function cleanup() {
  const repo = await prisma.repository.findUnique({ where: { url: repositoryUrl } });
  if (repo) {
    // delete children first if there's no ON DELETE CASCADE on the FK
    const files = await prisma.files.findMany({ where: { repositoryId: repo.id } });
    const fileIds = files.map((f) => f.id);
    if (fileIds.length) {
      await prisma.chunk.deleteMany({ where: { filesId: { in: fileIds } } });
      await prisma.files.deleteMany({ where: { repositoryId: repo.id } });
    }
    await prisma.repository.delete({ where: { id: repo.id } });
  }
}

test("check repository before storeRepo", async () => {
  await cleanup(); // ensure clean slate regardless of previous run's outcome

  const before = await prisma.repository.findUnique({ where: { url: repositoryUrl } });
  expect(before).toBeNull();

  await storeRepo(repositoryUrl);

  const after = await prisma.repository.findUnique({ where: { url: repositoryUrl } });
  expect(after).not.toBeNull();

  await cleanup(); // leave DB clean for next run too
  await prisma.$disconnect();
}, 30000);