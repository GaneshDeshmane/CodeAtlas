import fs from "node:fs/promises";
import path from "node:path";

function resolveWorkspacePath(
    workspace: string,
    filePath: string
) {
    const workspacePath = path.resolve(workspace);
    const targetPath = path.resolve(workspace, filePath);

    if (
        targetPath !== workspacePath &&
        !targetPath.startsWith(workspacePath + path.sep)
    ) {
        throw new Error("Path is outside workspace");
    }

    return targetPath;
}

export async function readFile(
    workspace: string,
    filePath: string
) {
    const fullPath = resolveWorkspacePath(
        workspace,
        filePath
    );

    return await fs.readFile(
        fullPath,
        "utf-8"
    );
}

export async function editFile(
    workspace: string,
    filePath: string,
    oldCode: string,
    newCode: string
) {
    const fullPath = resolveWorkspacePath(
        workspace,
        filePath
    );

    const content = await fs.readFile(
        fullPath,
        "utf-8"
    );

    if (!content.includes(oldCode)) {
        throw new Error(
            `Could not find target code in ${filePath}`
        );
    }

    const occurrences =
        content.split(oldCode).length - 1;

    if (occurrences !== 1) {
        throw new Error(
            `Expected exactly one occurrence in ${filePath}, found ${occurrences}`
        );
    }

    const updatedContent =
        content.replace(oldCode, newCode);

    await fs.writeFile(
        fullPath,
        updatedContent,
        "utf-8"
    );

    return {
        success: true,
        filePath
    };
}