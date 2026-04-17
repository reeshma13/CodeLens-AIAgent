import { ChromaClient, Collection } from "chromadb";
import { EmbeddedChunk } from "../embeddings/embedder";
import * as dotenv from "dotenv";
dotenv.config();

// Connect to ChromaDB running locally
const client = new ChromaClient();

// Collection = a named filing cabinet
// Like a database table but for vectors
let collection: Collection;

async function initCollection(name: string = "iskanda") {
  // Create collection if it doesn't exist
  // If it exists — just open it
  collection = await client.getOrCreateCollection({
    name,
    metadata: {
      description: "ISKANDA codebase embeddings"
    }
  });

  console.log(`✅ ChromaDB collection ready: ${name}`);
  return collection;
}

async function storeChunks(embeddedChunks: EmbeddedChunk[]) {
  // ChromaDB needs data in this specific format:
  // ids        → unique name for each chunk
  // embeddings → the vector (fingerprint)
  // documents  → the actual text content
  // metadatas  → extra info (file path, lines etc)

  const ids = embeddedChunks.map((ec, i) =>
    `chunk_${ec.chunk.filePath}_${ec.chunk.startLine}_${i}`
      .replace(/[^a-zA-Z0-9_]/g, "_") // ChromaDB only allows safe characters in IDs
  );

  const embeddings = embeddedChunks.map(ec => ec.embedding);

  const documents = embeddedChunks.map(ec => ec.chunk.content);

  const metadatas = embeddedChunks.map(ec => ({
    filePath: ec.chunk.filePath,
    startLine: ec.chunk.startLine,
    endLine: ec.chunk.endLine,
    index: ec.chunk.index,
  }));

  await collection.add({
    ids,
    embeddings,
    documents,
    metadatas,
  });

  console.log(`✅ Stored ${embeddedChunks.length} chunks in ChromaDB`);
}

// This is the magic function 🔍
// Give it a question's embedding → it finds most similar chunks
async function searchSimilarChunks(
  queryEmbedding: number[],
  topK: number = 3          // return top 3 most similar chunks
): Promise<string[]> {
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  // Return just the text content of matching chunks
  return results.documents[0] as string[];
}
// Add this function
async function collectionExists(name: string = "iskanda"): Promise<boolean> {
  try {
    const collections = await client.listCollections();
    return collections.some((c: any) => c === name || c.name === name);
  } catch {
    return false;
  }
}
async function resetCollection(name: string = "iskanda"): Promise<void> {
  try {
    await client.deleteCollection({ name });
    console.log(`🗑️ Cleared existing collection: ${name}`);
  } catch {
    // Collection didn't exist — that's fine
  }
}

export { initCollection, storeChunks, searchSimilarChunks, collectionExists, resetCollection };

/* 
=================================================================
initCollection()
→ Opens the filing cabinet
→ Creates it if it doesn't exist yet

storeChunks()
→ Puts all fingerprints INTO the cabinet
→ Stores: fingerprint + actual code + metadata

searchSimilarChunks()
→ THE MAGIC FUNCTION
→ Give it your question's fingerprint
→ Returns the 3 most similar code chunks
→ This is how ISKANDA finds relevant code 
=================================================================
*/