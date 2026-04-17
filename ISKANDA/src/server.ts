process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import express from "express";
import cors from "cors";
import { ExplainAgent } from "./agent/explainAgent";
import {
  addIngestedPath,
  getIngestedPaths,
  getActivePath,
  wasIngested
} from "./vectorstore/pathStore";
const app = express();
app.use(cors());
app.use(express.json());

const iskanda = new ExplainAgent();
let isReady = false;
// AUTO-RESTORE on server restart
// If ChromaDB has data + we have a saved path → mark as ready instantly
async function autoRestore() {
  const activePath = getActivePath();
  if (activePath) {
    try {
      console.log(`\n🔄 Auto-restoring from: ${activePath}`);
      await iskanda.ingest(activePath); // collectionExists check skips re-embedding
      isReady = true;
      console.log(`✅ Auto-restored! ISKANDA is ready.\n`);
    } catch (err) {
      console.log(`⚠️ Auto-restore failed — needs fresh ingestion`);
    }
  }
}

// Ingest endpoint
app.post("/ingest", async (req, res) => {
  let { folderPath } = req.body;
  folderPath = folderPath.replace(/\\/g, "/");

  if (!folderPath) {
    return res.status(400).json({ error: "folderPath is required" });
  }

  try {
    console.log(`\n🔱 Ingesting: ${folderPath}`);
    await iskanda.ingest(folderPath);
    isReady = true;

    // Save to pathStore
    addIngestedPath(folderPath);

    res.json({
      success: true,
      message: "Codebase ingested successfully!",
      paths: getIngestedPaths()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ask endpoint
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "question is required" });
  }
  if (!isReady) {
    return res.status(400).json({ error: "Please ingest a codebase first" });
  }

  try {
    const answer = await iskanda.ask(question);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset endpoint
app.post("/reset", async (req, res) => {
  try {
    const { resetCollection } = await import("./vectorstore/chromaStore");
    await resetCollection();
    isReady = false;
    res.json({ success: true, message: "Codebase cleared." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all ingested paths
app.get("/paths", (req, res) => {
  res.json({ paths: getIngestedPaths() });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "🔱 Engineer AI — Code Lens is running",
    isReady,
    activePath: getActivePath()
  });
});

const PORT = 3001;
app.listen(PORT, async () => {
  console.log(`\n🔱 Engineer AI — Code Lens`);
  console.log(`📡 Server running at http://localhost:${PORT}\n`);
  await autoRestore(); // ← restore on every restart
});