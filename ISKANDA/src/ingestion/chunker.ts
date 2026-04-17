import { CodeFile } from "./fileLoader";

// This describes what one chunk looks like
interface CodeChunk {
    content: string;      // the actual code in this chunk
    filePath: string;     // which file it came from
    startLine: number;    // where in the file it starts
    endLine: number;      // where in the file it ends
    index: number;        // chunk number (1st, 2nd, 3rd...)
}

// How many lines per chunk?
// Not too big (confuses Gemini)
// Not too small (loses context)
// 50 lines is the sweet spot for code
const CHUNK_SIZE = 100;

// How many lines to overlap between chunks?
// WHY OVERLAP? Imagine a function that spans chunk 1 and chunk 2
// Without overlap — you'd lose the connection
// With overlap — both chunks share some lines = context preserved
const OVERLAP = 10;

function chunkFiles(files: CodeFile[]): CodeChunk[] {
    const allChunks: CodeChunk[] = [];

    for (const file of files) {
        // Split file content into individual lines
        const lines = file.content.split("\n");

        // Skip empty files — nothing to chunk
        if (lines.length === 0) continue;

        let chunkIndex = 0;
        let startLine = 0;

        while (startLine < lines.length) {
            // Calculate where this chunk ends
            const endLine = Math.min(startLine + CHUNK_SIZE, lines.length);

            // Grab just those lines
            const chunkLines = lines.slice(startLine, endLine);
            const chunkContent = chunkLines.join("\n");

            // Only save chunk if it has actual content
            if (chunkContent.trim().length > 0) {
                // Option 2: Enrich chunk with metadata
                // This tells Gemini WHERE the code is from
                // and WHAT file it belongs to
                const enrichedContent = `
File: ${file.filePath}
Language: ${file.extension}
Lines: ${startLine + 1}-${endLine}
Code:
${chunkContent}
        `.trim();

                allChunks.push({
                    content: enrichedContent,
                    filePath: file.filePath,
                    startLine: startLine + 1,
                    endLine: endLine,
                    index: chunkIndex,
                });
                chunkIndex++;
            }

            // Move to next chunk — but go back OVERLAP lines
            // This is how we preserve context between chunks
            startLine += CHUNK_SIZE - OVERLAP;
        }
    }

    return allChunks;
}

export { chunkFiles, CodeChunk };