# CodeAtlas

CodeAtlas is an AI-powered tool that understands a GitHub repository well enough to answer questions about it — grounded in the actual code, not guesses.

Give it a repository URL, let it index the code, then ask it things like *"What does the storeRepo function do?"* and get an answer that cites the real chunks of code it was drawn from.

I'm building the whole pipeline myself — ingestion, chunking, embeddings, vector search, and retrieval-augmented generation — to actually understand how these pieces fit together, rather than relying on a framework that hides it.

**Status: 🚧 Work in progress — core pipeline is functional end to end.**

## Architecture:
<img width="1053" height="695" alt="Screenshot 2026-09-13 at 11 14 14 PM" src="https://github.com/user-attachments/assets/85e2d686-15ff-4c2f-940b-32944ea3a9b2" />



## What works right now

- Parse a GitHub repository URL and fetch its metadata, default branch, and file tree
- Filter to supported source files and pull their contents via the GitHub API
- Split files into overlapping chunks (`RecursiveCharacterTextSplitter`)
- Generate embeddings for every chunk locally via Ollama (`nomic-embed-text`, 768 dimensions)
- Store repositories, files, chunks, and embeddings in PostgreSQL with `pgvector`
- Run repository-scoped similarity search — retrieval is filtered to the correct repository, not just the closest match across everything ever ingested
- Answer natural-language questions about a repository using retrieved code as context, via a local LLM (Ollama)
- Expose ingestion and question-answering as HTTP endpoints (`/ingestion`, `/agent`)
- A minimal React frontend to ingest a repo and ask it questions

## Current flow

```
GitHub Repository
      ↓
Repository Metadata + Tree
      ↓
File Contents
      ↓
Chunking
      ↓
Embeddings (Ollama)
      ↓
PostgreSQL + pgvector
      ↓
Repository-scoped Retrieval
      ↓
LLM Answer (grounded in retrieved code, with sources)
```

## Tech stack

- TypeScript, Bun, Express
- GitHub REST API
- LangChain Text Splitters
- Ollama — `nomic-embed-text` for embeddings, a local chat model (e.g. `llama3.2:1b`) for answers
- PostgreSQL + `pgvector`
- Prisma
- React (frontend, Bun's built-in dev server)

## Getting started

### Prerequisites

- [Bun](https://bun.com)
- A PostgreSQL database with the `pgvector` extension enabled
- [Ollama](https://ollama.com) running locally, with at least:
  - `nomic-embed-text` pulled (embeddings)
  - a small chat model pulled (answers), e.g. `ollama pull llama3.2:1b`
- A GitHub personal access token (for higher API rate limits)

### Setup

```bash
bun install

# copy and fill in your own values
cp .env.example .env
```

Required environment variables:

```
DATABASE_URL=your_postgres_connection_string
GITHUB_TOKEN=your_github_token
OLLAMA_API=http://localhost:11434
```

Run database migrations:

```bash
bunx prisma migrate dev
```

### Run the backend

```bash
bun index.ts
```

The API runs on `http://localhost:3000` by default.

### Run the frontend

```bash
cd frontend
bun run dev
```

The frontend runs on a separate port (see `frontend/src/index.ts`) and talks to the backend API.

## API

### `POST /ingestion`

Ingests a GitHub repository: fetches its files, chunks them, embeds them, and stores everything.

```bash
curl -X POST http://localhost:3000/ingestion \
  -H "Content-Type: application/json" \
  -d '{"repository": "https://github.com/owner/repo"}'
```

### `POST /agent`

Asks a question about an already-ingested repository. Returns an answer plus the source chunks it was grounded in.

```bash
curl -X POST http://localhost:3000/agent \
  -H "Content-Type: application/json" \
  -d '{"repository": "https://github.com/owner/repo", "question": "What does the storeRepo function do?"}'
```

## What's next

- Better answer quality — currently limited by small, locally-run chat models; exploring larger models and reranking
- Re-ingestion / upsert support (currently a repository can only be ingested once)
- Batched embedding generation for faster ingestion on larger repositories
- Code-aware chunking (splitting by function/class boundaries rather than raw text length)
- Authentication and multi-user support
- Automated PR creation — propose a fix grounded in retrieved code, open it as a branch + pull request for human review

## Why I'm building this

I'm building CodeAtlas to learn by actually building the system — ingestion, embeddings, vector search, and RAG — rather than relying on ready-made abstractions to do it for me. The goal is a tool that can genuinely understand a codebase and help developers work with it, not just another wrapper around a chat model.
## Why I'm building this

Mostly to learn by actually doing it, not by stitching together someone else's abstractions. Long term I want this to be something that genuinely understands a codebase and helps you work in it — not just another chatbot with your repo dumped into its context.

---

Still very much a work in progress. If you're poking around the code and something looks half-finished, that's because it is 😅
