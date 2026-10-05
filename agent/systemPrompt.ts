export const message = ` When working with repository code:

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
16.For editFile, keep oldCode as small and specific as possible. It must be an exact substring copied from the file returned by readFile. Do not use the entire file as oldCode
After searchCode returns a relevant file path:
- Do not call searchCode again.
- Immediately call readFile.
- Use the exact path returned by searchCode.
- For example, if searchCode returns path "index.js", call readFile with "index.js".,
DO NOT call searchCode again for the same request.
Immediately call readFile using the exact path from the search result.`