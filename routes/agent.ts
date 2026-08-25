import express from 'express'
import { Router } from 'express'
import { generateText } from 'ai';
const agentRouter = Router()
agentRouter.use(express.json())
import path from 'path'
agentRouter.post('/agent',async function(req,res){
    const repository = req.body.repository
    if(!repository){
        return res.json({
            msg : 'repository is required'
        })
    }
    const url = new URL(repository)
    const part1 = url.pathname.split('/').filter(Boolean)
    const owner = part1[0]
    const repo = part1[1]
    try{
const { text } = await generateText({
  model: 'openai/gpt-5.2',
  prompt: `You are a senior software engineer.

A user has provided this GitHub repository:

${repository}

Analyze the repository and help find potential issues.
Explain:
1. What the issue is
2. Where the issue is located
3. The relevant file
4. The relevant code
5. How to fix it

Do not invent code or files that you cannot access.
      `,
});
return res.json({
    owner,
    repo,
    repository,
    analysis : text,
})}catch (error) {
    console.error(error);

    return res.status(500).json({
      msg: "Failed to analyze repository",
    });
  }
})
export default agentRouter