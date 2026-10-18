import simpleGit from "simple-git";
export async function gitPush(remoteName :string,branchName:string,localpath:string){
    const git = simpleGit(localpath)
    try{
    const gitPush = await git.push(remoteName,branchName)
    return{
        success: true, remoteName, branchName, gitPush
    }
    }catch(e){
        return{
            e
        }
    }
}