# CodeAtlas

AI-powered codebase assistant that understands GitHub repositories using embeddings, vector search, and RAG.

**Status: work in progress**

## What is this

CodeAtlas is something I'm building to help understand GitHub repos without having to go through every single file by hand. The idea is simple — give it a repo URL, let it process the code, and eventually just ask it questions about the codebase and get answers based on what's actually in there, not just guesses.

I'm building the whole pipeline myself instead of grabbing a RAG framework off the shelf, mainly because I want to actually understand how embeddings, vector search, and LLMs work together under the hood, not just call an API and hope it works.

## What's actually working right now

The repo-processing part is done and working. Right now CodeAtlas can:

- Parse a GitHub repo URL
- Pull the repo metadata
- Figure out the default branch
- Fetch the full repo tree
- Find the actual files worth looking at
- Fetch their contents
- Split everything into chunks
- Generate embeddings for those chunks

I tested it on a real repo and it spat out 238 chunks, each one embedded as a 768-dimensional vector. So the pipeline works end to end, up to embeddings.

What's missing: actually storing those embeddings somewhere and doing anything useful with them. That's the next chunk of work (pun intended).

## How it flows right now

```
GitHub Repository
      ↓
Repository Metadata
      ↓
Repository Tree
      ↓
File Contents
      ↓
Chunking
      ↓
Embeddings
      ↓
Vector Database   ← not built yet
      ↓
RAG                ← not built yet
```

Everything down to Embeddings works. Vector DB and RAG are next.

## Stack

- TypeScript + Bun
- Express
- GitHub API
- LangChain text splitters (for chunking)
- Ollama + nomic-embed-text (for embeddings, running locally)
- PostgreSQL + pgvector (coming soon)
- Prisma

## Embeddings

Right now I'm using `nomic-embed-text` through Ollama, running locally. It turns each chunk of code into a 768-dimensional vector.

```
code chunk → nomic-embed-text → [0.0387, -0.0156, -0.1517, ...] → 768 dims
```

## Folder layout

```
CodeAtlas/
├── db/                 → db stuff
├── frontend/           → frontend app
├── prisma/             → schema + migrations
├── generated/prisma/   → generated prisma client
├── routes/             → express routes
├── services/           → the actual pipeline logic
├── index.ts            → entry point
├── test-chunk.ts        → testing chunking
├── test-embedding.ts    → testing embeddings
└── test2.ts
```

## What's next

Still early days. Roughly in order:

- Set up PostgreSQL
- Add pgvector
- Actually store the chunks + embeddings
- Similarity search
- Build the RAG pipeline
- Let people ask questions about a repo and get real answers
- Make chunking code-aware instead of just splitting blindly
- Repo indexing
- Auth
- Eventually — let CodeAtlas suggest code changes and open PRs, with the user approving first

## Why I'm building this

Mostly to learn by actually doing it, not by stitching together someone else's abstractions. Long term I want this to be something that genuinely understands a codebase and helps you work in it — not just another chatbot with your repo dumped into its context.

---

Still very much a work in progress. If you're poking around the code and something looks half-finished, that's because it is 😅
