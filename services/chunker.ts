import { processRepo } from "./repository"
import{RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
export async function chuncking(repository : string){
    const data = await processRepo(repository)
    const file=data.files
    const chunk = []
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:1000,
    chunkOverlap:200
})
    for (let i = 0; i < file.length; i++) {
    const Currentfile = file[i]
    const size=Currentfile?.size
    const path = Currentfile?.path
    const content = Currentfile?.content
    const splitterdata=await splitter.splitText(content!)
    const data=splitterdata.map((data)=>{
        [['chunk' ,data],
        ['path',path]]
    })
    console.log(data)
    chunk.push(data)
}

}
