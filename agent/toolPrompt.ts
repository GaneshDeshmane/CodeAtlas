
export const tools = [
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
  