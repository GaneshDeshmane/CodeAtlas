// import { PrismaClient } from "./generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { Retrieve } from "./services/retrieval";
// import { searchCode } from "./agent/tools";
// const adapter = new PrismaPg({
//     connectionString: process.env.DATABASE_URL
// });

// const prisma = new PrismaClient({ adapter });

// async function main() {

//     const repositories = await prisma.repository.findMany({
//         select: {
//             id: true,
//             name: true,
//             url: true
//         }
//     });
    

//     console.log("\nRepositories:");
//     console.log(repositories);

//     if (repositories.length === 0) {
//         console.log("❌ No repositories found in database");
//         return;
//     }

//     const repository = repositories[0];

//     if (!repository) {
//         throw new Error("Repository not found");
//     }

//     console.log("\nTesting repository:");
//     console.log(repository);

//     const results = await Retrieve(
//         "GitHub repository authentication",
//         repository.id
//     );
//     const resultss = await searchCode(
//         "Express authentication middleware",
//         repository.id
//     );

//     console.log("\nSearch results:");
//     console.log(
//         JSON.stringify(results, null, 2)
//     );
//     console.log(resultss,null,2)
    
// }

// main()
//     .catch(console.error)
//     .finally(async () => {
//         await prisma.$disconnect();
//     });

const tools = [
    {
        type: "function",
        function: {
          name: "searchCode",
          description:
            "Search the repository for code matching the user's request. " +
            "Use this tool whenever the user asks you to find or search code.",
      
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "The exact thing to search for, such as 'JWT authentication' " +
                  "or 'MongoDB connection'."
              },
      
              repositoryId: {
                type: "number",
                description:
                  "The numeric ID of the repository to search."
              }
            },
      
            required: ["query", "repositoryId"]
          }
        }
      },
  {
    type: "function",
    function: {
      name: "readFile",
      description: "Read code from the repository",
      parameters: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Workspace name"
          },
          filePath: {
            type: "string",
            description: "Path of the file to read"
          }
        },
        required: ["workspace", "filePath"]
      }
    }
  }
];

async function run() {
  console.log("Sending request to Ollama...\n");

  const repo = await fetch("http://localhost:11434/api/chat", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      model: "llama3.2:1b",

      messages: [
        {
          role: "user",
          content:
            "Search repository 123 for JWT authentication code."
        }
      ],

      tools,

      stream: false
    })
  });

  if (!repo.ok) {
    console.error("Ollama request failed:");
    console.error(await repo.text());
    return;
  }

  const data = await repo.json();

  console.log("Full response:");
  console.log(JSON.stringify(data, null, 2));

  const toolCalls = data.message?.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    console.log("\n No tool call returned.");
    console.log("The model answered without using a tool.");
    return;
  }

  console.log("\n✅ Tool call detected!");

  for (const toolCall of toolCalls) {
    console.log("\nTool:", toolCall.function.name);
    console.log(
      "Arguments:",
      JSON.stringify(toolCall.function.arguments, null, 2)
    );
  }
}

run().catch((error) => {
  console.error("Test failed:");
  console.error(error);
});

