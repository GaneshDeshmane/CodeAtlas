
import { searchCode } from "./tools";
 import { readFile } from "./tools";
 import{repositoryTool}from"../gitservice/service/repositoryTool"
import { editFile } from "./tools";
 console.log("OLLAMA_API:", process.env.OLLAMA_API);

const tools = [
  {
      type: "function",
      function: {
        name: "searchCode",
        description:
        "Search the repository for relevant code. " +
        "The result includes the exact repository file paths. " +
        "When you need to inspect a file, use the exact 'path' value returned by this tool. " +
        "Never invent or guess a file path.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The exact thing to search for, such as 'organisation route' " +
                "or 'user route' or 'task route' or 'board route'."
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
    description:
    "Read an existing file from the repository. " +
    "filePath MUST exactly match a path returned by searchCode. " +
    "Never invent a file path.",
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
},{
  type: "function",
  function: {
    name: "editFile",
    description:
    "Edit an existing file in the repository. " +
    "filePath MUST exactly match a path returned by searchCode. " +
    "Never invent a file path.",
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path of the file to edit"
        },
        oldCode: {
          type: "string",
          description: "The old code to replace"
        },
        newCode: {
          type: "string",
          description: "The new code to replace the old code"
        }
      },
      required: ["filePath", "oldCode", "newCode"]
    }
  }
}
];

export async function run(query:string,repositoryId:number,workspace:string,repository:string){
  const messages = [
    {
      role: "system",
      content: `
 When working with repository code:

1. Use searchCode to find relevant files.
2. Inspect the search results.
3. Select an exact path returned by searchCode.
4. Use that exact path with readFile.
5. Never invent, guess, or construct a file path.
6. Do not use readFile until searchCode has returned a real path.
7. If the user only asks a question, answer once you have enough information.
8. If the user asks you to modify code, inspect the relevant file first and then use editFile.
9. For editFile, use the exact filePath returned by searchCode.
10. oldCode must come from the actual contents returned by readFile.
11. Do not read the same file more than once unless necessary.
12. For a modification request:

1. Search for the relevant file.
2. Read the file.
3. After reading the relevant file, you MUST call editFile to perform the requested modification.
4. Do not answer the user before the requested modification has been performed.
5. For editFile, oldCode must be a small exact substring copied from readFile.
6. newCode must implement exactly the requested change.

13. Do not use editFile until searchCode has returned a real path.
14. Do not perform additional searches once the relevant files have been identified and read.
15. For a question, once you have enough information, give the final answer. For a modification request, continue using the necessary tools until the requested modification is completed.
16.For editFile, keep oldCode as small and specific as possible. It must be an exact substring copied from the file returned by readFile. Do not use the entire file as oldCode`
    },
    {
      role: "user",
      content: query
    }
  ];
  const clonerepo = await repositoryTool(repository,workspace)
  if(clonerepo.success){
    let count:number=0;
    const max_count:number=10;
      while(count<max_count){
        count=count+1;
        console.log("Count:", count);
        console.log(
          "MESSAGES:",
          JSON.stringify(messages, null, 2)
        );
        const repo=await fetch("http://localhost:11434/api/chat",{
          method : "POST",
          headers:{"Content-Type": "application/json"},
          body:JSON.stringify({
              "model":"qwen2.5:3b",
              // "messages":[
              //     {"role":"user",
              //       "content":query}
              // ],
              messages,
              "tools":tools,
              stream:false,
          })
      })
      const data = await repo.json();
      const toolCalls=data.message.tool_calls
      //const Toolcall = data.message.tool_calls[0];
      if (!toolCalls||toolCalls.length==0) {
        return data.message.content
      }
      messages.push({
        role:"assistant",
        content:data.message.content||"",
        tool_calls:toolCalls
      })
      for(const toolCall of toolCalls){
        const toolName=toolCall.function.name;
        const args = toolCall.function.arguments
      
      let result;
      if (toolName === "searchCode") {
         result = await searchCode(
          args.query,
          repositoryId
        )}else if(toolName==="readFile"){
          result=await readFile(workspace,args.filePath)
        }else if(toolName==="editFile"){
          result=await editFile(workspace,args.filePath,args.oldCode,args.newCode)
        }else{
          result = {
            error: `Unknown tool: ${toolName}`
          };
        }
      // console.log(JSON.stringify(data, null, 2));
      // if(Toolcall){
      //   const toolName = Toolcall.function.name;
      // const args = Toolcall.function.arguments;
      
     
      
        console.log("Search result:", result);
        
        console.log(JSON.stringify(data, null, 2));  
        console.log("Tool:", toolName);
  console.log("Result:", result);

  messages.push({
    role: "tool",
    content: JSON.stringify(result),
    tool_call_id: toolCall.id
  });
}
console.log("Messages:", JSON.stringify(messages, null, 2));
      }
    }else{
      console.log("Repository not cloned")
      return
    }
  }


    run(
      "find the organisation route in the trello backend repository and add and change the status code to 200",
      87,
      "/tmp/codeatlas/your-workspace",
      "https://github.com/GaneshDeshmane/Trello-Backend"
    );