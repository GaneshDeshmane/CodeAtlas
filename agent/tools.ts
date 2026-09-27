import { Retrieve } from "../services/retrieval";
import { readFile, editFile } from "./filetool";
import type{ UseToolresponse } from "./type";
import "dotenv/config";

export async function searchCode(query: string,repositoryId: number){
    return await Retrieve( query,repositoryId);
}

export {
    readFile,
    editFile
};