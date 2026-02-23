import { ToolSet, createTool, registerParameter } from "../toolHelper";
import {
  readFileContent,
  createNewFile,
  updateFileContent,
  listFiles,
} from "./functions";

const readFileTool = createTool(
  "read_file",
  "Read the content of a specified file",
  {
    ...registerParameter("filePath", "string", "The path of the file to read"),
  },
  ({ filePath }: { filePath: string }) => {
    const content = readFileContent({ filePath });
    return `Content of file ${filePath}: ${content}`;
  }
);

const createFileTool = createTool(
  "create_file",
  "Create a new file with the specified content",
  {
    ...registerParameter(
      "filePath",
      "string",
      "The path of the file to create"
    ),
    ...registerParameter(
      "content",
      "string",
      "The content to write to the file"
    ),
  },
  ({ filePath, content }) => {
    createNewFile({ filePath, content });
    return `Content of created file ${filePath}: ${content}`;
  }
);

const updateFileTool = createTool(
  "update_file",
  "Update the content of an existing file",
  {
    ...registerParameter(
      "filePath",
      "string",
      "The path of the file to update"
    ),
    ...registerParameter(
      "newContent",
      "string",
      "The new content to write to the file"
    ),
  },
  ({ filePath, newContent }) => {
    const content = updateFileContent({ filePath, newContent });
    return `Content of updated file ${filePath}: ${content}`;
  }
);

const listFilesTool = createTool(
  "list_files",
  "List all files in a specified directory",
  {
    ...registerParameter(
      "dirPath",
      "string",
      "The path of the directory to list files from"
    ),
  },
  ({ dirPath }) => {
    const files = listFiles({ dirPath });
    return `Files in directory ${dirPath}: ${files.join(", ")}`;
  }
);

const codingToolSet = new ToolSet([
  readFileTool,
  createFileTool,
  updateFileTool,
  listFilesTool,
]);

export default codingToolSet;
