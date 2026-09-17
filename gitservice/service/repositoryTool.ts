import simpleGit from 'simple-git'
 export async function repositoryTool(githuburl: string, localpath: string) {
     const git = simpleGit()
     try {
         await git.clone(githuburl, localpath)
         return { success: true }
     } catch (e) {
         console.error('Clone failed:', e)
         return { success: false, error: e }
    }
    }