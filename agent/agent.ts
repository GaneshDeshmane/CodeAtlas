
import { searchCode } from "./tools";
 import { readFile } from "./tools";
 import{repositoryTool}from"../gitservice/service/repositoryTool"
import { editFile } from "./tools";
import { getDiff } from "../gitservice/service/getDiff";
import { message } from "./systemPrompt";
import{tools}from"./toolPrompt"
 console.log("OLLAMA_API:", process.env.OLLAMA_API);
export async function run(query:string,repositoryId:number,workspace:string,repository:string){
  const messages = [
    {
      role: "system",
      content: message
    },
    {
      role: "user",
      content: query
    },
  ];
  const clonerepo = await repositoryTool(repository,workspace)
  console.log("Clone repository:", clonerepo);
  if(clonerepo.success){
    let count:number=0;
    const max_count:number=10;
    const knownPath = new Set<string>
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
              "model":"qwen3.5:4b",
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
      console.log(data)
      const toolCalls=data.message.tool_calls
      console.log(data)
      //const Toolcall = data.message.tool_calls[0];
      if (!toolCalls||toolCalls.length==0) {
        return data.message.content
      }
      messages.push({
        role:"assistant",
        content:data.message.content||"",
        tool_calls:toolCalls
      })
       
        const toolCall = toolCalls[0]
        const toolName=toolCall.function.name;
        const args = toolCall.function.arguments
      
      let result;
      
      if (toolName === "searchCode") {
         result = await searchCode(
          args.query,
          repositoryId
        )
        for(const item of result){
          knownPath.add(item.path)
        }
      }else if(toolName==="readFile"){
        if (!knownPath.has(args.filePath)) {
          result = {
            error: `Invalid file path: ${args.filePath}. The path was not returned by searchCode.`
        }
        }else{
          result=await readFile(workspace,args.filePath)
        }
        }else if(toolName==="editFile"){
          if(knownPath.has(args.filePath)){
          result=await editFile(workspace,args.filePath,args.oldCode,args.newCode)
          }else{
            result = {
              error: `Invalid file path: ${args.filePath}. The path was not returned by searchCode.`
          }
          }
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
      }else{
      console.log("Repository not cloned")
      return
    }
    const GitDiff = await getDiff(workspace)
    console.log(GitDiff)
    if(GitDiff){
      console.log(`code editted`)
    }else{
      console.log(`error code edit`)
    }
  }


    // run(
    //   "edit the post organisation route in the trello backend repository and change the status code to 600",
    //   90,
    //   "/tmp/codeatlas/your-workspace",
    //   "https://github.com/GaneshDeshmane/Trello-Backend"
    // );