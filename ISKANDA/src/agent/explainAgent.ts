import { loadFilesFromFolder } from "../ingestion/fileLoader";
import { chunkFiles } from "../ingestion/chunker";
import { embedChunks } from "../embeddings/embedder";
import { initCollection, storeChunks, searchSimilarChunks, collectionExists, resetCollection } from "../vectorstore/chromaStore";
import { explainWithGroq } from "../llm/groq";

class ExplainAgent {
    private isIngested: boolean = false;
    async ingest(folderPath: string): Promise<void> {
        console.log(`\n🔱 ISKANDA ingesting: ${folderPath}\n`);

        // Clear old data first
        await resetCollection();
        console.log(`\n🔱 ISKANDA checking existing data...\n`);

        // Check if already ingested — skip if yes!
        const exists = await collectionExists();
        if (exists) {
            console.log(`✅ Using existing ChromaDB data — skipping embedding!`);
            await initCollection();
            this.isIngested = true;
            return;
        }

        console.log(`🔱 ISKANDA ingesting: ${folderPath}\n`);

        const files = loadFilesFromFolder(folderPath);
        console.log(`✅ Found ${files.length} files`);

        const chunks = chunkFiles(files);
        console.log(`✅ Created ${chunks.length} chunks`);

        const embeddedChunks = await embedChunks(chunks);
        console.log(`✅ Embedded ${embeddedChunks.length} chunks`);

        await initCollection();
        await storeChunks(embeddedChunks);

        this.isIngested = true;
        console.log(`\n✅ ISKANDA is ready!\n`);
    }

    async ask(question: string): Promise<string> {
        if (!this.isIngested) {
            return "❌ Please ingest a codebase first";
        }

        const questionChunk = [{
            content: question,
            filePath: "query",
            startLine: 0,
            endLine: 0,
            index: 0,
        }];

        const embeddedQuestion = await embedChunks(questionChunk);
        const questionEmbedding = embeddedQuestion[0].embedding;

        const relevantChunks = await searchSimilarChunks(questionEmbedding, 3);
        const explanation = await explainWithGroq(question, relevantChunks);

        return explanation;
    }
}

export { ExplainAgent };