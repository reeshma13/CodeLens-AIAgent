process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { ChromaClient } from "chromadb";
import * as dotenv from "dotenv";
dotenv.config();

async function checkChroma() {
  const client = new ChromaClient();
  
  // List all collections
  const collections = await client.listCollections();
  console.log(`\n📦 Collections in ChromaDB: ${collections.length}`);
  console.log(collections);

  // Get iskanda collection details
  const collection = await client.getCollection({ name: "iskanda" });
  const count = await collection.count();
  console.log(`\n✅ Total chunks stored: ${count}`);

  // Get all stored items
  const items = await collection.get();
  
  // Extract unique file paths
  const filePaths = new Set(
    items.metadatas
      ?.filter(m => m !== null)
      .map((m: any) => m.filePath)
  );

  console.log(`\n📄 Files embedded (${filePaths.size} unique files):\n`);
  [...filePaths].sort().forEach(f => console.log(`  ✅ ${f}`));
}

checkChroma();