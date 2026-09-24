import { Retrieve } from "../services/retrieval";
import { readFile, editFile } from "./filetool";
import type{ UseToolresponse } from "./type";

export async function searchCode(query: UseToolresponse,repositoryId: number){
    return await Retrieve( query.query,repositoryId);
}

export {
    readFile,
    editFile
};