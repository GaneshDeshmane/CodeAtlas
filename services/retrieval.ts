import type { respo } from './types'
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const OLLAMA_API = process.env.OLLAMA_API

async function generateEmbedding(query: string): Promise<number[]> {
    if (!OLLAMA_API) {
        throw new Error('OLLAMA_API environment variable not set')
    }
    const result = await fetch(`${OLLAMA_API}/api/embeddings`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "nomic-embed-text",
            prompt: query
        })
    })
    if (!result.ok) {
        throw new Error(`Ollama error: ${result.status}`)
    }
    const data = await result.json() as respo
    return data.embedding
}


export async function storeEmbedding(chunkId: number, content: string) {
    const embedding = await generateEmbedding(content)
    const embeddingVector = `[${embedding.join(",")}]`
    await prisma.$executeRaw`
        INSERT INTO "embedding" ("chunkId", "data","createdAt","updatedAt")
        VALUES (${chunkId}, ${embeddingVector}::vector,now(),now())
    `
}

export async function Retrieve(text: string, repositoryId: number) {
  const embedding = await generateEmbedding(text)
  const embeddingVector = `[${embedding.join(",")}]`

  const resultQuery = await prisma.$queryRaw`
    SELECT
      c."chunkId",
      c."content",
      c."position",
      f."path",
      1 - (e."data" <=> ${embeddingVector}::vector) AS similarity
    FROM "embedding" e
    JOIN "chunk" c
      ON c."chunkId" = e."chunkId"
    JOIN "files" f
      ON f."id" = c."filesId"
    WHERE f."repositoryId" = ${repositoryId}
      AND f."path" !~ '(^|/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb)$'
    ORDER BY e."data" <=> ${embeddingVector}::vector
    LIMIT 5
`;
  return resultQuery
}