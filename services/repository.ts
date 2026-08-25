import {githubParser,githubMetadata,githubTree} from "./github"
export async function processRepo(repository:string){
     const data = githubParser(repository)
        const owner=  data.owner
        const repo = data.repo
        const metadata = await githubMetadata(owner,repo)
        const githubTreedata = await githubTree(owner,repo,metadata.defaultBranch)
        return{
            owner,
            repo,
            metadata,
            tree : githubTreedata,
            repository
        }
}