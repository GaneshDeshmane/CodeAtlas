import simpleGit from "simple-git";
export async function branch(localpath : string , branchName : string){
    const git = simpleGit(localpath)
    const createBranch = await git.checkoutLocalBranch(branchName)
    return{
        success : true,
        branchName
    }
}
