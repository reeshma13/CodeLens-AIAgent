import * as fs from "fs";
import * as path from "path";

const STORE_PATH = path.join(process.cwd(), "ingested-paths.json");

interface IngestedPath {
  folderPath: string;
  ingestedAt: string;
  fileCount?: number;
  chunkCount?: number;
}

interface PathStore {
  paths: IngestedPath[];
  activeCollection: string | null;
}

// Read store from disk
function readStore(): PathStore {
  if (!fs.existsSync(STORE_PATH)) {
    return { paths: [], activeCollection: null };
  }
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

// Save store to disk
function writeStore(store: PathStore): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

// Add a new ingested path
function addIngestedPath(
  folderPath: string,
  fileCount?: number,
  chunkCount?: number
): void {
  const store = readStore();

  // Remove duplicate if exists
  store.paths = store.paths.filter(p => p.folderPath !== folderPath);

  // Add to front of list
  store.paths.unshift({
    folderPath,
    ingestedAt: new Date().toISOString(),
    fileCount,
    chunkCount,
  });

  // Keep only last 10 paths
  store.paths = store.paths.slice(0, 10);
  store.activeCollection = folderPath;

  writeStore(store);
}

// Get all stored paths
function getIngestedPaths(): IngestedPath[] {
  return readStore().paths;
}

// Get last active path
function getActivePath(): string | null {
  return readStore().activeCollection;
}

// Check if a path was previously ingested
function wasIngested(folderPath: string): boolean {
  const store = readStore();
  return store.paths.some(p => p.folderPath === folderPath);
}

export {
  addIngestedPath,
  getIngestedPaths,
  getActivePath,
  wasIngested,
  IngestedPath
};