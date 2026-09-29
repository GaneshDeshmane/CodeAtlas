// import type{ UseToolresponse } from "./type";
// import{z}from "zod";
// const prompt=`
// You are a helpful assistant that can help with code search and code generation.
// You are given a repository id, a query, and a request. The request is a description of the code you need to generate.based on the query determine what tools you have to use to generate the code.
// `;
import { ru } from "zod/v4/locales";
import { askAgent } from "../frontend/src/api";
import { searchCode } from "./tools";
 import { readFile } from "./tools";
 console.log("OLLAMA_API:", process.env.OLLAMA_API);
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
    
            // repositoryId: {
            //   type: "number",
            //   description:
            //     "The numeric ID of the repository to search."
            // }
          },
    
          required: ["query"]//"repositoryId"
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
        // workspace: {
        //   type: "string",
        //   description: "Workspace name"
        // },
        filePath: {
          type: "string",
          description: "Path of the file to read"
        }
      },
      required: ["filePath"]//"workspace"
    }
  }
}
];

export async function run(query:string,repositoryId:number,workspace:string){
          const repo=await fetch("http://localhost:11434/api/chat",{
        method : "POST",
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify({
            "model":"qwen2.5:3b",
            "messages":[
                {"role":"user",
                  "content":query}
            ],
            "tools":tools,
            stream:false,
        })
    })
    const data = await repo.json();
    const Toolcall = data.message.tool_calls[0];
    console.log(JSON.stringify(data, null, 2));
    if(Toolcall){
      const toolName = Toolcall.function.name;
    const args = Toolcall.function.arguments;
    
    if (toolName === "searchCode") {
      const result = await searchCode(
        args.query,
        repositoryId
      );
    
      console.log("Search result:", result);
      
      console.log(JSON.stringify(data, null, 2));

      // while(true){
        
      //   if (!toolName) {
      //     return data
      //   }
      //   for (let i = 0; i < Toolcall.length; i++) {
          
          
      //   }
      // }
      const repo2=await fetch("http://localhost:11434/api/chat",{
        method:"POST",
        headers:{"Content-Type" : "application/json"},
        body:JSON.stringify({
          "model":"qwen2.5:3b",
          "messages":[
            {"role":"user",
              "content":query},
            {"role":"assistant","content":data.message.content||"",tool_calls:data.message.tool_calls},
            {
              "role":"tool",
              "content":JSON.stringify(result),
              tool_call_id:data.message.tool_calls[0].id
            }
          ],
          "tools":tools,
          stream :false
    })
  })
  const data2=await repo2.json()
  const Toolcall2=data2.message.tool_calls
  console.log(JSON.stringify(data2, null, 2));
  if (Toolcall2){
    
  }
  //const raw = await repo2.text()
    }else{
      return data.message.content
    }
    
      
   
//   console.log("SECOND RESPONSE:");
// console.log(raw);
  // console.log(JSON.stringify(data2, null, 2));
  // console.log(JSON.stringify(data2.message.tool_calls))
    }
}

run(
  "Find where JWT authentication is implemented in this repository and read the relevant authentication file, then explain how it works.",
  82,
  "/tmp/codeatlas/your-workspace"
);