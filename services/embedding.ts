import { processRepo } from "./repository"
import { chuncking } from "./chunker"
import type{ chunkModel ,repositoryModel,embeddingModel ,filesModel,UserQueryModel } from "../generated/prisma/models"
import { Prisma } from "../generated/prisma/client"

export const storeRepo = async function (repository : string) {
    const processdata = await processRepo(repository)
    const content = processdata.content
    const file = processdata.files
    const chunksdata = await chuncking(content)
    
    
}