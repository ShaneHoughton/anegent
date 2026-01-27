const fs = require("fs");
const path = require("path");

/**
 * Creates a new file with the specified content.
 * @param {string} filePath - The path of the file to create.
 * @param {string} content - The content to write to the file.
 * createNewFile("./output/newFile.txt", "Hello, world!");
 */
function createNewFile({ filePath, content = "" }) {
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
 * updateFileContent("./output/newFile.txt", "Updated content!");
 */
function updateFileContent({ filePath, newContent }) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  // Update the file
  fs.writeFileSync(filePath, newContent, "utf8");
  console.log(`File updated at: ${filePath}`);
  return readFileContent({ filePath });
}

/**
 * Lists all files in a directory.
 * @param {string} dirPath - The path of the directory to list files from.
 * @returns {string[]} - An array of file names in the directory.
 * listFiles("./output");
 */
function listFiles({ dirPath }) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath).filter((file) => {
    const fullPath = path.join(dirPath, file);
    return fs.statSync(fullPath).isFile();
  });

  console.log(`Files in directory ${dirPath}:`, files);
  return files;
}

/**
 * Reads the content of a file.
 * @param {string} filePath - The path of the file to read.
 * @returns {string} - The content of the file.
 * readFileContent("./output/newFile.txt");
 */
function readFileContent({ filePath }) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  return content;
}

module.exports = {
  readFileContent,
  createNewFile,
  updateFileContent,
  listFiles,
};
