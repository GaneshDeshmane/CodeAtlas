import simpleGit from "simple-git";
export async function getDiff(localpath:string){
    const git = simpleGit(localpath)
    return await git.diff()
}