import {
    githubParser,
    githubMetadata,
    githubTree,
    fileContent,
  } from "./services/github";
  
  const repository =
    "https://github.com/GaneshDeshmane/llm-orchestrator/tree/main/Backend";
  
  async function test() {
    try {
      const parsed = githubParser(repository);
  
      console.log("Owner:", parsed.owner);
      console.log("Repo:", parsed.repo);
  
      const metadata = await githubMetadata(
        parsed.owner,
        parsed.repo
      );
  
      console.log("Branch:", metadata.defaultBranch);
  
      const tree = await githubTree(
        parsed.owner,
        parsed.repo,
        metadata.defaultBranch
      );
  
      console.log("Files found:", tree.length);
  
      const firstFile = tree[0];
  
      console.log("\nFirst tree file:");
      console.dir(firstFile, { depth: null });
  
      if (!firstFile) {
        throw new Error("No files found in tree");
      }
  
      console.log("\nFetching content for:", firstFile.path);
  
      const content = await fileContent(
        parsed.owner,
        parsed.repo,
        metadata.defaultBranch,
        firstFile.path
      );
  
      console.log("\nFile content result:");
      console.dir(content, { depth: null });
  
      console.log("\nContent length:", content.content.length);
    } catch (error) {
      console.error("\nTest failed:");
      console.error(error);
    }
  }
  
  test();