// import type{ UseToolresponse } from "./type";
// import{z}from "zod";
// const prompt=`
// You are a helpful assistant that can help with code search and code generation.
// You are given a repository id, a query, and a request. The request is a description of the code you need to generate.based on the query determine what tools you have to use to generate the code.
// `;
import { searchCode } from "./tools";
 import { readFile } from "./tools";
// export class agent{
//     constructor(repositoryId:number,request:string){
//         this.repositoryId=repositoryId;
//         this.request=request;
//     async function run() {
//         const Usetool=await fetch("http://localhost:11434/api/generate",{
//             method : "POST",
//             headers:{
//                 "Content-Type": "application/json",
//             },
//             body:JSON.stringify({
//                 "model":"llama3.1:8b",
//                 "prompt":`${prompt}query${this.request} `, 
//             })
//         })
//         const UseToolresponse=await Usetool.json();
//         const UseToolresponseSchema=z.object({
//             model:z.string(),
//             prompt:z.string(),
//             query:z.string(),
//             })
//         const parsedUseToolresponse=UseToolresponseSchema.parse(UseToolresponse);
//         const code=await searchCode(parsedUseToolresponse as UseToolresponse,this.repositoryId);
//         const readCode=await readFile(code);
//         const codegenerated=await llmCall(readCode,parsedUseToolresponse as UseToolresponse);
//         return codegenerated;
//     }

//         async function llmCall(content:string,query:UseToolresponse){
//             const repo=await fetch("http://localhost:11434/api/generate",{
//                 method:"POST",
//                 headers:{
//                     "Content-Type": "application/json",
//                 },
//                 body:JSON.stringify({
//                     "model":"llama3.1:8b",
//                     "prompt":`${prompt}
//                     query: ${UseToolresponse}
//                     Repository ID: ${this.repositoryId}
//                     Request: ${this.request}
//                     `,
//                 })
//             })
//             const data=await repo.json();
//             return data.response;
//         }
//     }
   
// }

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

export async function run(){
          const repo=await fetch("http://localhost:11434/api/chat",{
        method : "POST",
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify({
            "model":"llama3.2:1b",
            "messages":[
                {"role":"user",
                  "content":"Search repository 123 for JWT authentication code"}
            ],
            "tools":tools,
            stream:false,
        })
    })
    const data = await repo.json();
    const Toolcall = data.message.tool_calls[0];

    const toolName = Toolcall.function.name;
    const args = Toolcall.function.arguments;
    
    if (toolName === "searchCode") {
      const result = await searchCode(
        args.query,
        args.repositoryId
      );
    
      console.log("Search result:", result);
      
      console.log(JSON.stringify(data, null, 2));
      await fetch("http://localhost:11434/api/chat",{
        method:"POST",
        headers:{"Content-Type" : "application/json"},
        body:JSON.stringify({
          "model":"llama3.2:1b",
          "messages":[
            result
          ],
    })
  })
    }
   
}
