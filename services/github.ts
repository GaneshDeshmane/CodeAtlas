export function githubParser(repository:string) {
    const link = new URL(repository)
    if(link.host!=="github.com"){
        throw new Error("Github url is invalid")
    }
    const part1=link.pathname.split('/').filter(Boolean)
    const owner = part1[0]
    const repo = part1[1]
    if (!owner || !repo) {
        throw new Error("Invalid GitHub repository URL");
      }
    return {
        owner,
        repo: repo.replace(".git", ""),
      };
}
export  async function githubMetadata(owner:string,repo:string) {
    const respo = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    type data={
        name : string,
        full_name : string,
        description:string,
        default_branch:string,
        language:string
    }
    const data = await respo.json() as data
    console.log(data.name)
    console.log(data.default_branch)
    
    return({
        name:   data.name,
        fullName: data.full_name,
        description: data.description,
        defaultBranch: data.default_branch,
        language: data.language
    })
}

type githubTreestr = {
    path : string,
    mode : string,
    type : "blob" | "tree",
    sha : string
}
type githubTreestrre={
    tree : githubTreestr[]
}
export async function githubTree(owner:string , repo : string , branch : string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`)
    const data = await response.json() as githubTreestrre
    const files =data.tree.filter(
        (item)=>item.type==="blob"
    )
    return files  
}
type GitHubFileResponse = {
    name: string;
    path: string;
    sha: string;
    size: number;
    content: string;
    encoding: string;
  };
export async function fileContent(owner :string,repo:string,branch:string,path:string){
    const respo = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`)
    const data = await respo.json() as GitHubFileResponse
    const htmldata = data.content
    const decoded=Uint8Array.fromBase64(htmldata)
    const html=new TextDecoder().decode(decoded)

    return{
        path: data.path,
        content: html,
        size: data.size
    }
}
const file = await fileContent(
    "GaneshDeshmane",
    "llm-orchestrator",
    "main",
    "Frontend/index.html"
)

console.log(file)