import { ToolSet, createTool, registerParameter } from "../toolHelper";
import {
  readFileContent,
  createNewFile,
  updateFileContent,
  listFiles,
  deleteFile,
} from "./functions";

const readFileTool = createTool({
  name: "read_file",
  description: "Read the content of a specified file",
  parametersProps: {
    ...registerParameter("filePath", "string", "The path of the file to read"),
  },
  fn: ({ filePath }: { filePath: string }) => {
    const content = readFileContent({ filePath });
    return `Content of file ${filePath}: ${content}`;
  },
});

const createFileTool = createTool({
  name: "create_file",
  description: "Create a new file with the specified content",
  parametersProps: {
    ...registerParameter(
      "filePath",
      "string",
      "The path of the file to create",
    ),
    ...registerParameter(
      "content",
      "string",
      "The content to write to the file",
    ),
  },
  fn: ({ filePath, content }: { filePath: string; content: string }) => {
    createNewFile({ filePath, content });
    return `Content of created file ${filePath}: ${content}`;
  },
});

const updateFileTool = createTool({
  name: "update_file",
  description: "Update the content of an existing file",
  parametersProps: {
    ...registerParameter(
      "filePath",
      "string",
      "The path of the file to update",
    ),
    ...registerParameter(
      "newContent",
      "string",
      "The new content to write to the file",
    ),
  },
  fn: ({ filePath, newContent }: { filePath: string; newContent: string }) => {
    const content = updateFileContent({ filePath, newContent });
    return `Content of updated file ${filePath}: ${content}`;
  },
});

const listFilesTool = createTool({
  name: "list_files",
  description: "List all files in a specified directory",
  parametersProps: {
    ...registerParameter(
      "dirPath",
      "string",
      "The path of the directory to list files from",
    ),
  },
  fn: ({ dirPath }: { dirPath: string }) => {
    const files = listFiles({ dirPath });
    return `Files in directory ${dirPath}: ${files.join(", ")}`;
  },
});

const deleteFileTool = createTool({
  name: "delete_file",
  description: "Delete a file with a given path",
  parametersProps: {
    ...registerParameter(
      "filePath",
      "string",
      "The path of the file to delete",
    ),
  },
  fn: ({ filePath }: { filePath: string }) => {
    deleteFile({ filePath });
    return `Files in directory ${filePath} has been deleted`;
  },
  requireConfirmation: true,
});

const codingToolSet = new ToolSet([
  readFileTool,
  createFileTool,
  updateFileTool,
  listFilesTool,
  deleteFileTool,
]);

export default codingToolSet;
