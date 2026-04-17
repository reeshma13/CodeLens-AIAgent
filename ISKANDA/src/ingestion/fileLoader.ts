import * as fs from "fs";
import * as path from "path";

const SUPPORTED_EXTENSIONS = [
  ".ts", ".js", ".tsx", ".jsx",
  ".py", ".java", ".cpp", ".c",
  ".html", ".css", ".json", ".md"
];

interface CodeFile {
  filePath: string;
  content: string;
  extension: string;
}

function loadFilesFromFolder(inputPath: string): CodeFile[] {
  const result: CodeFile[] = [];

  // Safely get stats of the input path
  let inputStat;
  try {
    inputStat = fs.statSync(inputPath);
  } catch {
    console.warn(`⚠️ Path does not exist: ${inputPath}`);
    return result;
  }

  // ✅ If it's a FILE — just read that one file
  if (inputStat.isFile()) {
    const ext = path.extname(inputPath);
    if (SUPPORTED_EXTENSIONS.includes(ext)) {
      try {
        result.push({
          filePath: inputPath,
          content: fs.readFileSync(inputPath, "utf-8"),
          extension: ext,
        });
        console.log(`📄 Reading single file: ${inputPath}`);
      } catch {
        console.warn(`⚠️ Could not read file: ${inputPath}`);
      }
    } else {
      console.warn(`⚠️ Unsupported file type: ${ext}`);
    }
    return result;
  }

  // ✅ If it's a FOLDER — read everything inside recursively
  function readFolder(currentPath: string) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      if (["node_modules", ".git", "dist", ".next", "build", "coverage"].includes(item)) {
        continue;
      }

      const fullPath = path.join(currentPath, item);

      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        console.warn(`⚠️ Skipping unreadable: ${fullPath}`);
        continue;
      }

      if (stat.isSymbolicLink()) continue;

      if (stat.isDirectory()) {
        readFolder(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          try {
            result.push({
              filePath: fullPath,
              content: fs.readFileSync(fullPath, "utf-8"),
              extension: ext,
            });
          } catch {
            console.warn(`⚠️ Skipping unreadable file: ${fullPath}`);
          }
        }
      }
    }
  }

  readFolder(inputPath);
  return result;
}

export { loadFilesFromFolder, CodeFile };




/* ===================================================================
**🔍 WHAT this file does:**
Goes into any folder you give it, opens every code file, reads what's inside, gives it back to you as a neat list.

**🤔 WHY we need it:**
Without this, ISKANDA is blind. It can't see your codebase at all. This is literally the eyes of the system.

**🧠 LEARN — 3 things happening here:** 
======================================================================

======================================================================
1. SUPPORTED_EXTENSIONS → we only care about code files
   (ignoring images, videos, etc — they mean nothing to an LLM)

2. interface CodeFile → TypeScript safety
   Every file MUST have filePath, content, extension
   No missing data allowed

3. Recursive readFolder → folders inside folders
   Your codebase isn't flat — it has folders inside folders
   This function keeps going deeper until it finds all files 
======================================================================
*/