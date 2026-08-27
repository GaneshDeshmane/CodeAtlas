import {githubParser,githubMetadata,githubTree,fileContent,type GitHubFileResponse} from "./github"
export async function processRepo(repository:string){
     const data = githubParser(repository)
        const owner=  data.owner
        const repo = data.repo
        const metadata = await githubMetadata(owner,repo)
        const githubTreedata = await githubTree(owner,repo,metadata.defaultBranch)
        const first  = githubTreedata[0]
        if (!first) {
            throw new Error('file not found')
        }
        const files = githubTreedata.slice(0,10)
        Promise.all(
            files.map(file=>fileContent(
                owner,repo,metadata.defaultBranch,first.path
            )
            
        )
        
        )
    const filedata=await fileContent(owner,repo,metadata.defaultBranch,first.path as string)
    return{
        path : filedata.path,
        content : filedata.content,
        size : filedata.size,
        files :filedata,
        owner,
        repo,
        metadata,
        tree : githubTreedata,
        repository
    }
}