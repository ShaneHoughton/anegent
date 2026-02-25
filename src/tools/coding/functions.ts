import fs from "fs";
import path from "path";

/**
 * Creates a new file with the specified content.
 * @param {string} filePath - The path of the file to create.
 * @param {string} content - The content to write to the file.
 * @returns {string} The content of the created file
 * createNewFile("./output/newFile.txt", "Hello, world!");
 */
export function createNewFile({
  filePath,
  content = "",
}: {
  filePath: string;
  content: string;
}) {
  const dir = path.dirname(filePath);

  // Ensure the directory exists
  fs.mkdirSync(dir, { recursive: true });

  // Write the file
  fs.writeFileSync(filePath, content, "utf8");
  return readFileContent({ filePath });
}

/**
 * Updates the content of an existing file.
 * @param {string} filePath - The path of the file to update.
 * @param {string} newContent - The new content to write to the file.
 * @returns {string} The updated content of the file
 * updateFileContent("./output/newFile.txt", "Updated content!");
 */
export function updateFileContent({
  filePath,
  newContent,
}: {
  filePath: string;
  newContent: string;
}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`\nFile does not exist: ${filePath}`);
  }

  // Update the file
  fs.writeFileSync(filePath, newContent, "utf8");
  console.info(`\nFile updated at: ${filePath}`);
  return readFileContent({ filePath });
}

/**
 * Lists all files in a directory.
 * @param {string} dirPath - The path of the directory to list files from.
 * @returns {string[]} - An array of file names in the directory.
 * listFiles("./output");
 */
export function listFiles({ dirPath }: { dirPath: string }): string[] {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`\nDirectory does not exist: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath).filter((file) => {
    const fullPath = path.join(dirPath, file);
    return fs.statSync(fullPath).isFile();
  });

  console.log(`\nFiles in directory ${dirPath}:`, files);
  return files;
}

/**
 * Reads the content of a file.
 * @param {string} filePath - The path of the file to read.
 * @returns {string} - The content of the file.
 * readFileContent("./output/newFile.txt");
 */
export function readFileContent({ filePath }: { filePath: string }): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`\nFile does not exist: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  return content;
}
