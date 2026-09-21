# CodeAtlas

CodeAtlas is an AI-powered tool I'm building to help understand GitHub repositories without having to go through every file manually.

The idea is simple: give it a GitHub repo, let it process the code, and then ask questions about the codebase and get answers based on the actual code — not guesses.

I'm building the whole pipeline myself (no LangChain RAG abstractions, no vector DB-as-a-service) so I actually understand how embeddings, vector search, and LLM orchestration fit together under the hood.

**Status:** 🚧 Work in progress. The good news is it's further along than it sounds — the full pipeline actually runs end to end now. The catch is it's still rough around the edges and definitely not something I'd expose publicly yet (more on that below).

## What's actually working

This used to just be a chunking/embedding pipeline. It's grown since then. Right now CodeAtlas can:

- Take a GitHub repo URL and pull its metadata, default branch, and full file tree
- Filter down to the files worth indexing and fetch their contents
- Split files into chunks (LangChain's text splitter — 1000 chars, 200 overlap)
- Generate embeddings for each chunk locally using Ollama + `nomic-embed-text` (768 dimensions)
- Store everything in Postgres with pgvector
- Take a question, embed it, run a similarity search scoped to a specific repo, and pull back the top matching chunks
- Feed those chunks into a local LLM (`llama3.2:1b` via Ollama) with a prompt that forces it to answer only from the retrieved code and cite its sources
- Return the answer along with the source chunks it used, so you can actually check its work

So the "ask questions about a codebase" part — the whole point of the project — works now. I also wired up login with Auth0/OAuth, and there's an early sandboxed file-read/edit tool sitting in `agent/` that isn't hooked up to anything yet — that's for later, once I get to the "let it actually propose code changes" stage.

## Tech I'm using

- TypeScript + Bun
- Express
- GitHub API
- LangChain Text Splitters
- Ollama (running `nomic-embed-text` for embeddings, `llama3.2:1b` for generation — all local, no external API calls for the AI parts)
- PostgreSQL + pgvector
- Prisma
- Auth0 + Passport for login

## How it flows

```
GitHub repo URL
   → metadata + file tree
   → file contents
   → chunking
   → embeddings (Ollama, 768-dim)
   → Postgres + pgvector
   → similarity search on a question
   → grounded prompt → local LLM
   → answer + cited sources
```
## Architecture:
<img width="1053" height="695" alt="Screenshot 2026-09-13 at 11 14 14 PM" src="https://github.com/user-attachments/assets/85e2d686-15ff-4c2f-940b-32944ea3a9b2" />

## Running it yourself

Heads up — I haven't written a proper setup guide yet, this is reconstructed from the `.env` variables the code expects, so if something's missing, that's probably why.

1. You'll need Bun, Postgres with pgvector enabled, and Ollama running locally with `nomic-embed-text` and `llama3.2:1b` pulled.
2. `bun install`
3. Drop a `.env` file in the root with:
   ```
   DATABASE_URL=postgresql://...
   OLLAMA_API=http://localhost:11434
   GITHUB_TOKEN=your_github_token
   SESSION_SECRET=whatever_random_string
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=...
   AUTH0_CLIENT_SECRET=...
   BACKEND_URL=http://localhost:3001
   FRONTEND_URL=http://localhost:5173
   ```
4. `bunx prisma migrate deploy`
5. `bun index.ts` — runs on port 3001
6. Ingest a repo:
   ```bash
   curl -X POST http://localhost:3001/ingestion \
     -H "Content-Type: application/json" \
     -d '{"repository": "https://github.com/owner/repo"}'
   ```
7. Ask it something:
   ```bash
   curl -X POST http://localhost:3001/agent \
     -H "Content-Type: application/json" \
     -d '{"repository": "https://github.com/owner/repo", "question": "how does auth work here?"}'
   ```

## Being honest about what's not ready yet

I'd rather list this stuff than have someone find it the hard way:

- **Re-ingesting a repo isn't handled gracefully.** If you ingest the same repo twice right now it'll probably just error out on the unique constraint instead of updating.
- **No rate limiting or batching yet**, so bigger repos are going to be slow and could get me rate-limited by GitHub or hammer my local Ollama instance.
- **No tests, no CI.** There's a couple of scratch files (`test-chunk.ts`, `test2.ts`, etc.) from when I was poking at things manually, not a real test suite.
- **There's leftover debug stuff in the code** — commented-out blocks, some console.logs I forgot to clean up, a typo'd error message I need to fix.
- **Not much input validation** beyond basic type checks, so a malformed repo URL or a huge repo could break things in unexpected ways.
- **No license yet.**

## What's next

- Make ingestion idempotent (update instead of erroring on re-ingest)
- Add rate limiting / batching for GitHub and Ollama calls
- Actually wire up the file-edit tool so CodeAtlas can propose code changes and open a PR once I approve it
- Re-indexing when a repo updates
- Write actual tests
- Smarter, code-aware chunking instead of plain character splitting

## Why I'm building this

Mostly to learn by actually building it, instead of reaching for pre-made RAG frameworks and vector DB SDKs. The long-term goal is for CodeAtlas to genuinely understand a codebase and help you work in it — not just be another wrapper around a chatbot.
