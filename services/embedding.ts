import { processRepo } from "./repository"
import { chuncking } from "./chunker"
import type{ chunkModel ,repositoryModel,embeddingModel ,filesModel,UserQueryModel } from "../generated/prisma/models"
import type{ embedding , chunk , repository , files , UserQuery } from "../generated/prisma/client"
import { Prisma, PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { fileContent } from "./github"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({adapter})
export const storeRepo = async function (repository : string) {
    console.log("DATABASE:", process.env.DATABASE_URL)
    const processdata = await processRepo(repository)
    // const file = processdata.files[0]?.content
    // const size =processdata.files[0]?.size
    //  const chunksdata = await chuncking(repository)
    console.log("URL BEING INSERTED:", processdata.repository);
    const repositorydata = await prisma.repository.create({
        data:{
            name : processdata.metadata.name,
            path:processdata.path,
            owner:processdata.owner,
            url:processdata.repository
        } 
    }
    
    )
    for (let i = 0; i < processdata.files.length; i++) {
        const firstpath = processdata.files[i]?.path
        const firstcontent=processdata.files[i]?.content
        if (typeof firstpath!=="string"||firstpath.length ===0) {
            console.warn(`Skipping file at index ${i}: missing path`, processdata.files[i])
            continue
        }
        if (typeof firstcontent!=="string"||firstcontent.length===0){
            console.warn(`Skipping file at index ${i}: missing path`, processdata.files[i])
            continue
        }
         const filedata=await prisma.files.create({
        data:{
            repositoryId:repositorydata.id,
            fileContent:firstcontent,
            path:firstpath
        }
    })
    const filedatachunk = await chuncking(filedata.fileContent)
    for (let i = 0; i < filedatachunk.length; i++){
       const chunks = filedatachunk[i]
       if (!chunks) {
        throw new Error('chunks error')
       }
       await prisma.chunk.create({
        data:{
            content:chunks,
            filesId:filedata.id,
            position:i
        }
    })
    }
    
    }
   
    
   

}

//storeRepo("https://github.com/GaneshDeshmane/llm-orchestrator")