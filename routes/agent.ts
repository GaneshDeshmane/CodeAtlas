import express from 'express'
import { Router } from 'express'
import { Retrieve } from '../services/retrieval'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
const OLLAMA_API = process.env.OLLAMA_API

const agentRouter = Router()
agentRouter.use(express.json())

agentRouter.post('/', async function (req, res) {
    const { repository, question } = req.body

    if (typeof repository !== 'string' || repository.length === 0) {
        return res.status(400).json({ msg: 'repository is required' })
    }
    if (typeof question !== 'string' || question.length === 0) {
        return res.status(400).json({ msg: 'question is required' })
    }
    
    try {
        const repositoryRow = await prisma.repository.findUnique({
            where: { url: repository }
        })
        if (!repositoryRow) {
            return res.status(404).json({
                msg: 'Repository not ingested yet. Call the ingest endpoint first.'
            })
        }
        const chunks = await Retrieve(question, repositoryRow.id) as {
            chunkId: number
            content: string
            position: number
            similarity: number
        }[]

        if (chunks.length === 0) {
            return res.json({
                answer: "I couldn't find anything relevant to that question in this repository.",
                sources: []
            })
        }

        const context = chunks
            .map((c, i) => `[source ${i + 1}]\n${c.content}`)
            .join('\n\n---\n\n')

        const prompt = `You are a senior software engineer helping a user understand a codebase.
    Using ONLY the code context below, answer the user's question. Cite sources using [source N] notation.
    Do not invent code or files that are not shown to you.
    If the context doesn't contain enough information to answer, say so.
    Context:
    ${context}
    Question: ${question}`
        const ollamaResponse = await fetch(`${OLLAMA_API}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2:1b',
                prompt,
                stream: false
            })
        })
        if (!ollamaResponse.ok) {
            throw new Error(`Ollama error: ${ollamaResponse.status}`)
        }
        const data = await ollamaResponse.json() as {response: string}
        return res.json({
            answer: data.response,
            sources: chunks.map(c => ({
                chunkId: c.chunkId,
                position: c.position,
                similarity: c.similarity,
                preview: c.content.slice(0, 200)
            }))
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: 'Failed to analyze repository' })
    }
})

export default agentRouter