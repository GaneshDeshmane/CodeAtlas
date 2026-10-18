import { Octokit, App } from "octokit";
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN, // Personal Access Token
  });
  export async function createPullRequest(owner : string,repository:string,branchName:string,target:string,title:string,description:string){
    const data = await octokit.rest.pulls.create({
        owner : owner,
        repo:repository,
        title:title,
        head:branchName,
        body:description,
        base:target
    })
    return{
        data
    }
  }