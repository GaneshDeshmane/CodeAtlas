import simpleGit from 'simple-git'
export async function createBranch(localpath:string,branchName:string){
    const git = simpleGit(localpath)
    await git.checkoutLocalBranch(branchName)
    return branchName
}