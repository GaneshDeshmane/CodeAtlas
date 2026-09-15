//import { processRepo } from "./repository"
import{RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
export async function chuncking(content : string){
    //const data = await processRepo(repository)
    //const file=data.files
    //const chunk = []
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:1000,
    chunkOverlap:200
})
    // for (let i = 0; i < file.length; i++) {
    // const Currentfile = file[i]
        //  const size=content?.size
        //  const path = content?.path
        //  const contents = content?.content
    const splitterdata=await splitter.splitText(content)
    // const data=splitterdata.map((data)=>{
    //     return {chunk  : data ,path :  path}
    // })
    // for (let i = 0; i < data.length; i++) {
    //     const eachChunk = data[i]
    //     chunk.push(eachChunk)
    // }
    
//}
    return splitterdata
}
