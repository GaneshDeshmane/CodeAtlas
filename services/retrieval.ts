import type{respo}from'./types'
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const OLLAMA_API = process.env.OLLAMA_API
export async function Retrieve(text : string) {
    async function generateEmbedding(query:string){
        const result = await fetch(`${OLLAMA_API}/api/embeddings`,{
            method:'POST',
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
            model :"nomic-embed-text",
            prompt :query
            })
        })
        if (!result.ok) {
            throw new Error(`Ollama error: ${result.status}`)
        }
        const respo = await result.json() as respo
        return respo.embedding
        
    }
    const embedding = await generateEmbedding(text)
    console.log(embedding)
    const embeddingVector:string = `[${embedding.join(",")}]`
  
 async function  storeCode(){
const resultQuery=await prisma.$queryRaw`
SELECT
      c."chunkId",
      c."content",
      c."position",
      1 - (e."data" <=> ${embeddingVector}::vector) AS similarity
    FROM "embedding" e
    JOIN "chunk" c
      ON c."chunkId" = e."chunkId"

    ORDER BY e."data" <=> ${embeddingVector}::vector
    LIMIT 3
  `;
  return resultQuery
}
const result=await storeCode()
console.log(result)
return result
}
Retrieve('hi there')
