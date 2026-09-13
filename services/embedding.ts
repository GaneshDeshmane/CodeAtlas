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
    // const file = processdata.files[0]?.content
    // const size =processdata.files[0]?.size
    //  const chunksdata = await chuncking(repository)
    const repositorydata = await prisma.repository.create({
        data:{
            name : processdata.metadata.name,
            path:processdata.path,
            owner:processdata.owner,
            url:processdata.repository
        } 
    }
    )
    const firstcontent=processdata.files[0]?.content
    if (!firstcontent) {
        throw new Error('file doesnt there')
    }
    const firstpath = processdata.files[0]?.path
    if (!firstpath) {
        throw new Error('file doesnt there')
    }
    await prisma.files.create({
        data:{
            repositoryId:repositorydata.id,
            fileContent:firstcontent,
            path:firstpath
        }
    })

}

storeRepo("https://github.com/GaneshDeshmane/llm-orchestrator")