# Helper Agent

An AI-powered GitHub repository analysis agent built with **TypeScript, Express, Bun, GitHub API, and the Vercel AI SDK**.

The goal of this project is to allow users to provide a GitHub repository URL and have an AI agent analyze the repository for potential issues.

## Features

- Parse GitHub repository URLs
- Extract repository owner and name
- Fetch repository metadata using the GitHub API
- Fetch the repository file tree
- Process repository information through a service layer
- Analyze repositories using an LLM
- REST API for submitting repository URLs

## Architecture

```text
Client
  │
  │ POST /agent
  ▼
agent.ts
  │
  │ processRepo(repository)
  ▼
repository.ts
  │
  ├── githubParser()
  ├── githubMetadata()
  └── githubTree()
          │
          ▼
      GitHub API
          │
          ▼
   Repository Data
          │
          ▼
    Vercel AI SDK
          │
          ▼
      LLM Analysis
```

## Project Structure

```text
helper-agent/
│
├── index.ts
│
├── routes/
│   └── agent.ts
│
├── services/
│   ├── github.ts
│   └── repository.ts
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

## How It Works

The user sends a GitHub repository URL:

```text
https://github.com/username/repository
```

The application then:

1. Parses the GitHub URL.
2. Extracts the repository owner and name.
3. Fetches repository metadata.
4. Fetches the repository file tree.
5. Sends repository information to an AI model.
6. Returns the AI-generated analysis.

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/helper-agent.git
```

Move into the project directory:

```bash
cd helper-agent
```

Install dependencies:

```bash
bun install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key
```

Make sure your `.env` file is included in `.gitignore`:

```text
.env
node_modules
```

## Running the Project

Start the server:

```bash
bun index.ts
```

The server will run on:

```text
http://localhost:3000
```

## API Usage

### Analyze a Repository

**Endpoint**

```text
POST /agent
```

**Request Body**

```json
{
  "repository": "https://github.com/GaneshDeshmane/llm-orchestrator"
}
```

You can test the API using curl:

```bash
curl -X POST http://localhost:3000/agent \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "https://github.com/GaneshDeshmane/llm-orchestrator"
  }'
```

## Example Response

```json
{
  "owner": "GaneshDeshmane",
  "repo": "llm-orchestrator",
  "repository": "https://github.com/GaneshDeshmane/llm-orchestrator",
  "analysis": "AI-generated repository analysis..."
}
```

## Tech Stack

- TypeScript
- Bun
- Express
- GitHub REST API
- Vercel AI SDK
- OpenAI

## Current Limitations

Currently, the agent can retrieve:

- Repository metadata
- Repository file tree

The next step is to allow the agent to retrieve and analyze the actual contents of repository files.

```text
Current:

Repository
    ↓
Metadata + File Tree
    ↓
LLM


Next Version:

Repository
    ↓
File Tree
    ↓
Retrieve Source Files
    ↓
Chunk Code
    ↓
Index Code
    ↓
Retrieve Relevant Context
    ↓
LLM Agent
    ↓
Issue Detection + Suggested Fix
```

## Roadmap

- [x] Parse GitHub repository URLs
- [x] Fetch repository metadata
- [x] Fetch repository file tree
- [x] Create repository processing service
- [x] Connect repository processing to Express API
- [x] Integrate an LLM
- [ ] Retrieve repository file contents
- [ ] Filter unsupported files
- [ ] Code chunking
- [ ] AST parsing
- [ ] Vector embeddings
- [ ] RAG-based code retrieval
- [ ] Multi-file repository analysis
- [ ] Issue detection
- [ ] Generate code fixes
- [ ] GitHub Pull Request generation
- [ ] Background repository indexing
- [ ] Database integration
- [ ] Authentication

## Future Vision

The goal is to evolve Helper Agent into an AI software engineering agent capable of:

- Understanding large codebases
- Finding bugs
- Explaining issues
- Locating relevant files
- Analyzing dependencies
- Suggesting fixes
- Generating code patches
- Creating pull requests

---

Helper Agent is an experimental project focused on learning how AI agents, RAG, GitHub APIs, and LLMs can be combined to build intelligent software engineering tools.
