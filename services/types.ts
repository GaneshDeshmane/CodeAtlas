import type { Embedding } from "ai"


export type githubTreestrre={
    tree : githubTreestr[]
}

export type githubTreestr = {
    path : string,
    mode : string,
    type : "blob" | "tree",
    sha : string,
}
export  type data={
    name : string,
    full_name : string,
    description:string,
    default_branch:string,
    language:string
}
export type GitHubFileResponse = {
    name: string;
    path: string;
    sha: string;
    size: number;
    content: string;
    encoding: string;
};
export type respo = {
    embedding : number[]
}
export const Supportdata=["ts",
    "tsx",
    "js",
    "jsx",
    "py",
    "java",
    "cpp",
    "c",
    "h",
    "hpp",
    "go",
    "rs",
    "rb",
    "php",
    "json",
    "yaml",
    "yml",
    "md",
    "txt",
    "css",
    "html",
    "sql"
    ]