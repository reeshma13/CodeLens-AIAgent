import { GoogleGenerativeAI } from "@google/generative-ai";
import { CodeChunk } from "../ingestion/chunker";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to pause execution
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001"
});

interface EmbeddedChunk {
  chunk: CodeChunk;
  embedding: number[];
}

async function embedChunk(chunk: CodeChunk, retries: number = 3): Promise<EmbeddedChunk> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await embeddingModel.embedContent({
        content: {
          parts: [{ text: chunk.content }],
          role: "user"
        }
      });
      return {
        chunk,
        embedding: result.embedding.values,
      };
    } catch (error: any) {
      if (attempt < retries) {
        console.log(`⚠️ Chunk failed, retry ${attempt}/${retries} in 30s...`);
        await delay(30000);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed after all retries");
}

async function embedChunks(chunks: CodeChunk[]): Promise<EmbeddedChunk[]> {
  const embedded: EmbeddedChunk[] = [];

  console.log(`⏳ Starting embedding process for ${chunks.length} chunks...`);

  for (let i = 0; i < chunks.length; i++) {
    const result = await embedChunk(chunks[i]);
    embedded.push(result);
    
    console.log(`   ✅ Embedded chunk ${i + 1}/${chunks.length} → ${result.embedding.length} dimensions`);

    // --- RATE LIMIT LOGIC START ---
    
    // 1. Pause for 60 seconds every 20 chunks
    if ((i + 1) % 25 === 0 && (i + 1) < chunks.length) {
      console.log(`\n⏸️  BATCH LIMIT REACHED: Waiting 60 seconds to reset quota...\n`);
      await delay(45000); 
    } 
    // 2. Small 500ms breather between every single request to avoid "burst" triggers
    else if (i + 1 < chunks.length) {
      await delay(500); 
    }

    // --- RATE LIMIT LOGIC END ---
  }

  return embedded;
}

export { embedChunks, EmbeddedChunk };