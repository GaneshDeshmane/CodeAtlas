
import { run } from "../agent/agent";

async function testRun() {
  const result = await run(
    "Find the README.md file and add a short section titled 'CodeAtlas Test' at the end. Do not change any other content.",
    Number(process.env.TEST_REPOSITORY_ID),
    "/tmp/codeatlas-test-run",
    "https://github.com/GaneshDeshmane/coursera.git",
    "test: add CodeAtlas test section",
    "GaneshDeshmane",
    "coursera"
  );

  console.log("Final result:", result);
}

testRun().catch(console.error);
