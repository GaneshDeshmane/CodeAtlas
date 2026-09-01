CodeAtlas

CodeAtlas is an AI-powered tool I'm building to help understand GitHub repositories without having to go through every file manually.

The idea is pretty simple: give it a GitHub repository, let it process the code, and eventually be able to ask questions about the codebase and get answers based on the actual code.

I'm building the whole pipeline myself so I can understand how things like RAG, embeddings, vector search, and LLMs actually work together.

What I've built so far

The GitHub repository processing part is working.

CodeAtlas can currently:

Parse a GitHub repository URL
Get repository metadata
Get the default branch
Fetch the repository tree
Find the files in the repository
Fetch the contents of those files
Split files into smaller chunks
Generate embeddings for those chunks

I tested the pipeline on a repository and it generated 238 chunks, with each embedding having 768 dimensions.

Current flow
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
Vector Database
       ↓
RAG

The chunking and embedding part is already working. The next step is storing those embeddings in PostgreSQL using pgvector.

Tech I'm using
TypeScript
Bun
Express
GitHub API
LangChain Text Splitters
Ollama
nomic-embed-text
PostgreSQL
pgvector
Prisma
Embeddings

I'm currently using nomic-embed-text locally through Ollama.

The model generates a 768-dimensional vector for each chunk.

For example:

Code chunk
    ↓
nomic-embed-text
    ↓
[0.0387, -0.0156, -0.1517, ...]
    ↓
768 dimensions
What's next

The project is still in early development. My next goals are:

Set up PostgreSQL
Add pgvector
Store chunks and embeddings
Implement similarity search
Build the RAG pipeline
Let users ask questions about repositories
Improve code-aware chunking
Add repository indexing
Add authentication
Eventually allow CodeAtlas to make code changes and create pull requests after getting approval from the user
Why I'm building it

I'm mainly building CodeAtlas to learn by actually building the system instead of just using ready-made abstractions.

The goal is to eventually turn it into something that can actually understand a codebase and help developers work with it, rather than just being another AI chatbot.

Status: 🚧 Work in progress
