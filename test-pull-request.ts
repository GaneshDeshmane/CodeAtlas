import { Octokit } from "octokit";
import { createPullRequest } from "./gitservice/service/pull";

async function testCreatePullRequest() {
  const owner = process.env.GITHUB_TEST_OWNER!;
  const repository = process.env.GITHUB_TEST_REPO!;
  const branchName = process.env.GITHUB_TEST_HEAD!;
  const target = process.env.GITHUB_TEST_BASE || "main";

  const title = `test: CodeAtlas PR test ${Date.now()}`;
  const description =
    "Automated test of the CodeAtlas pull request service.";

  if (
    !process.env.GITHUB_TOKEN ||
    !owner ||
    !repository ||
    !branchName
  ) {
    throw new Error(
      "Set GITHUB_TOKEN, GITHUB_TEST_OWNER, GITHUB_TEST_REPO, and GITHUB_TEST_HEAD"
    );
  }

  try {
    // Create the pull request using your service.
    const result = await createPullRequest(
      owner,
      repository,
      branchName,
      target,
      title,
      description
    );
    console.log("Service result:", JSON.stringify(result, null, 2));
    const pr = result.data.data;
    if (!pr?.number || !pr?.html_url) {
      throw new Error(
        "Pull request creation returned no PR number or URL"
      );
    }

    // Verify the PR exists on GitHub.
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const { data: verifiedPR } =
      await octokit.rest.pulls.get({
        owner,
        repo: repository,
        pull_number: pr.number
      });

    if (
      verifiedPR.title !== title ||
      verifiedPR.head.ref !== branchName ||
      verifiedPR.base.ref !== target
    ) {
      throw new Error(
        "Created PR details did not match the test inputs"
      );
    }

    console.log("PASS: pull request created and verified");
    console.log("PR number:", verifiedPR.number);
    console.log("PR URL:", verifiedPR.html_url);
    console.log("Head branch:", verifiedPR.head.ref);
    console.log("Base branch:", verifiedPR.base.ref);
  } catch (error) {
    console.error("FAIL: pull request test failed");
    console.error(error);
    process.exitCode = 1;
  }
}

testCreatePullRequest();
