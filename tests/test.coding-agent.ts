import { randomUUID } from "node:crypto";
import { prisma } from "./db/db";
import { searchCode } from "./agent/tools";
import { readFile } from "./agent/filetool";
import { repositoryTool } from "./gitservice/service/repositoryTool";

const repositoryId = 79;

async function main() {
  console.log("=================================");
  console.log("CodeAtlas Coding Agent Test");
  console.log("=================================\n");

  const userRequest =
    "Understand how authentication works in this repository. Find the authentication middleware and explain how it verifies the JWT.";

  console.log("User request:");
  console.log(userRequest);
  console.log();

  // -----------------------------------------
  // 1. Get repository from database
  // -----------------------------------------

  const repository = await prisma.repository.findUnique({
    where: {
      id: repositoryId,
    },
  });

  if (!repository) {
    throw new Error(`Repository ${repositoryId} not found`);
  }

  console.log("📦 Repository:");
  console.log(repository);
  console.log();

  // -----------------------------------------
  // 2. Create isolated workspace
  // -----------------------------------------

  const workspace = `/tmp/codeatlas/${randomUUID()}`;

  console.log("📁 Workspace:");
  console.log(workspace);
  console.log();

  // Change this if your Prisma field has another name
  const githubUrl =
    (repository as any).githubUrl ??
    (repository as any).url ??
    (repository as any).github_url;

  if (!githubUrl) {
    throw new Error(
      "Could not find GitHub URL on repository. Check your Prisma Repository model."
    );
  }

  // -----------------------------------------
  // 3. Clone repository
  // -----------------------------------------

  console.log("⬇️ TOOL CALL: cloneRepository");
  console.log(`URL: ${githubUrl}`);
  console.log();

  await repositoryTool(githubUrl, workspace);

  console.log("✅ Repository cloned");
  console.log();

  // -----------------------------------------
  // 4. Search code
  // -----------------------------------------

  console.log("🔎 TOOL CALL: searchCode");
  console.log("Query: authentication middleware JWT verification");
  console.log();

  const results = await searchCode(
    "authentication middleware JWT verification",
    repositoryId
  );

  console.log("Search results:");
  console.log(JSON.stringify(results, null, 2));
  console.log();

  if (!results || results.length === 0) {
    throw new Error("No relevant code found");
  }

  // -----------------------------------------
  // 5. Pick most relevant file
  // -----------------------------------------

  const relevantFile = results[0].path;

  console.log(`📂 Relevant file: ${relevantFile}`);
  console.log();

  // -----------------------------------------
  // 6. Read file from actual workspace
  // -----------------------------------------

  console.log("📖 TOOL CALL: readFile");
  console.log(`File: ${relevantFile}`);
  console.log();

  const fileContent = await readFile(
    workspace,
    relevantFile
  );

  console.log("File content:");
  console.log("---------------------------------");
  console.log(fileContent);
  console.log("---------------------------------");
  console.log();

  // -----------------------------------------
  // 7. Send code to LLM
  // -----------------------------------------

  console.log("🤖 TOOL CALL: LLM");
  console.log();

  const prompt = `
You are CodeAtlas, an AI coding agent.

The user asked:

"${userRequest}"

Here is the relevant source file:

File: ${relevantFile}

\`\`\`
${fileContent}
\`\`\`

Explain how authentication works in this repository.

Specifically explain:
1. Where the JWT is received
2. How the token is extracted
3. How the JWT is verified
4. What information is extracted from the JWT
5. How the authenticated user is passed to the next route
`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2:1b",
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  console.log("=================================");
  console.log("🤖 CodeAtlas Answer");
  console.log("=================================\n");

  console.log(data.response);

  console.log("\n=================================");
  console.log("✅ Coding agent test completed");
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error("\n❌ Coding agent test failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });