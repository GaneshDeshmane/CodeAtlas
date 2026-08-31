import {githubParser,githubMetadata,githubTree,fileContent,type GitHubFileResponse , type githubTreestr} from "./github"
export async function processRepo(repository:string){
     const data = githubParser(repository)
        const owner=  data.owner
        const repo = data.repo
        const metadata = await githubMetadata(owner,repo)
        const githubTreedata = await githubTree(owner,repo,metadata.defaultBranch)
        const files = githubTreedata
        if (!files) {
            throw new Error('files not found sky')
        }
        const contentFile = await Promise.all(
            files.map(file=>fileContent(
                owner,repo,metadata.defaultBranch,file.path
            )
        )
        )
    
        // const first  = githubTreedata[0]
        // if (!first) {
        //    throw new Error('file not found')
        //  }
        // const files = first.files
        //     const contentFile =await Promise.all(
        //     files.map(file=>fileContent(
        //         owner,repo,metadata.defaultBranch,file.path
        //     )
        // )
        
        //)
     

        
        if(!contentFile[0]){
            throw new Error('file have no content')
        }
   // const filedata=await fileContent(owner,repo,metadata.defaultBranch,contentFile[0].path)
    return{
        path : contentFile[0].path,
        content : contentFile[0].content,
        size : contentFile[0].size,
        files :contentFile,
        owner,
        repo,
        metadata,
        tree : githubTreedata,
        repository
    }
}
