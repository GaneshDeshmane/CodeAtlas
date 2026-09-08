import { processRepo } from "./repository"
import { chuncking } from "./chunker"
import type{ chunkModel ,repositoryModel,embeddingModel ,filesModel,UserQueryModel } from "../generated/prisma/models"
import type{ embedding , chunk , repository , files , UserQuery } from "../generated/prisma/client"
import { Prisma, PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({adapter})
export const storeRepo = async function (repository : string) {
    const processdata = await processRepo(repository)
    //const content = processdata.content
    const file = processdata.files[0]?.content
    // const chunksdata = await chuncking(content)
//    const storedata = await prisma.chunk.createMany({
//     data :[
       
//     ]
//    })
console.log(file)
}

storeRepo("https://github.com/GaneshDeshmane/llm-orchestrator")