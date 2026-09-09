import dotenv from 'dotenv'
dotenv.config()
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
import{z} from "zod"
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
    if (!GITHUB_TOKEN) {
        throw new Error('token not found')
    }
    const respo = await fetch(`https://api.github.com/repos/${owner}/${repo}`,{
        headers: new Headers({
            'Authorization':`Bearer ${GITHUB_TOKEN!}`
        })
    })
    if (!respo.ok) {
        throw new Error('error respo')
    }
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
    console.log(data)
    return({
        name:   data.name,
        fullName: data.full_name,
        description: data.description,
        defaultBranch: data.default_branch,
        language: data.language
    })
}

export type githubTreestr = {
    path : string,
    mode : string,
    type : "blob" | "tree",
    sha : string,
}
type githubTreestrre={
    tree : githubTreestr[]
}
export async function githubTree(owner:string , repo : string , branch : string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,{
        headers:new Headers({
            'Authorization':`Bearer ${GITHUB_TOKEN!}`
        })
    })
    if (!response.ok) {
        throw new Error('error respo')
    }
    const data = await response.json() as githubTreestrre
    //const files =data.tree.filter(
      //  (item)=>item.type==="blob"
    //)
  const files= data.tree.filter(
    (item)=>
        item.type=="blob" && item.mode !=="120000"
  )
//     const excludeFile=data.tree.filter(
//         (item)=>(
//         item.mode==="12000"
//         )
//   )
    return files   
}
export type GitHubFileResponse = {
    name: string;
    path: string;
    sha: string;
    size: number;
    content: string;
    encoding: string;
  };
  
export async function fileContent(owner :string,repo:string,branch:string,path:string){
    const respo = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,{
        headers:new Headers({
            'Authorization':`Bearer ${GITHUB_TOKEN!}`
        })
    })
    if (!respo.ok) {
        throw new Error('error respo')
    }
    const data = await respo.json() as GitHubFileResponse
    const respoType=z.object({
        name: z.string(),
        path: z.string(),
        sha: z.string(),
        size: z.number(),
        content: z.string(),
        encoding: z.string(),
    })
    const respoP=respoType.safeParse(data)
    if (!respoP.success) {
        throw new Error('parsing errorgggggggggggggggggg')
    }
   
    const htmldata = respoP.data.content
    
    const decoded=Uint8Array.fromBase64(htmldata)
    const html=new TextDecoder().decode(decoded)
    return{
        path:  respoP.data.path,
        content: html,
        size: respoP.data.size
    }
   
}