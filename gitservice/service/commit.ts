import simpleGit from "simple-git";
export async function gitCommit(files : string[],message:string,localpath:string){
const git = simpleGit(localpath)
const gitadd = await git.add(files)
const gitCommit=await git.commit(message)
return{
    success : true,
    commit : gitCommit.commit
    }
}