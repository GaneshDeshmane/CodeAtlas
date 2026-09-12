import type{respo}from'./types'
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
   
    const embedding : number[] = await generateEmbedding(text)
    console.log(embedding)
    const embeddingVector:string = `[${embedding.join(",")}]`
    
`
SELECT
      c."chunkId",
      c."content",
      c."position",
      1 - (e."data" <=> ${embeddingVector}::vector) AS similarity
    FROM "embedding" e
    JOIN "chunk" c
      ON c."chunkId" = e."chunkId"
    WHERE c."filesId" = ${file.id}
    ORDER BY e."data" <=> ${embeddingVector}::vector
    LIMIT 3
  `;
}
Retrieve('hi there')
