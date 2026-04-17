# ⚙️ Engineer AI
### *Multi-Agent AI Software Engineering Platform*

> **Engineer AI** — A modular AI platform built as a system of specialized agents, each powered by shared intelligence. Built phase by phase, starting with **Code Lens**.
>
> 🔱 *Inspired by **ISKANDA** (इष्कन्द) — combining Ishana (ईशान, ruler of all directions) and Skanda (स्कन्द, the strategic commander, son of Shiva).*

---

## 📖 Table of Contents

1. [What is Engineer AI?](#what-is-engineer-ai)
2. [Phase 1 — Code Lens](#phase-1--code-lens)
3. [What We Learned](#what-we-learned)
4. [Tech Stack & Why We Chose It](#tech-stack--why-we-chose-it)
5. [Project Roadmap](#project-roadmap)
6. [File Structure](#file-structure)
7. [How Each File Works](#how-each-file-works)
8. [Prerequisites](#prerequisites)
9. [Installation](#installation)
10. [How to Run](#how-to-run)
11. [Package.json Scripts](#packagejson-scripts)
12. [Environment Variables](#environment-variables)
13. [Issues Faced & Solutions](#issues-faced--solutions)
14. [API Endpoints](#api-endpoints)
15. [Future Phases](#future-phases)

---

## What is Engineer AI?

**Engineer AI** is a **multi-agent AI platform** for software engineering. Think of it as an AI team of developers that can understand, explain, debug, test, and optimize any codebase.

Each phase of Engineer AI is a specialized agent:

```
Phase 1 → Code Lens        ← Current
Phase 2 → Copilot
Phase 3 → QA Generator
Phase 4 → Debug Agent
Phase 5 → Memory Layer
Phase 6 → Orchestrator
Phase 7 → Performance + Dependency Agents
```

---

## Phase 1 — Code Lens

**Code Lens** is the first agent of Engineer AI. Point it at any codebase (local folder or single file) and ask questions in plain English:

```
"How does authentication work?"
"What does this project do?"
"Where is the payment logic?"
"What are the main components?"
```

### How it works (Simple explanation)

Think of your codebase as a **messy toy box** 🧸

```
fileLoader    → picks up every toy (reads all files)
chunker       → cuts each toy into labeled pieces
embedder      → gives each piece a secret fingerprint (vector)
chromaStore   → filing cabinet that stores + searches fingerprints
groq/gemini   → the expert who explains what they find
explainAgent  → the desk where you talk to the expert
```

When you ask a question:
```
Your question → gets a fingerprint too
              → filing cabinet finds similar fingerprints
              → those code pieces go to the AI
              → AI explains in plain English
```

This technique is called **RAG (Retrieval-Augmented Generation)**.

---

## What We Learned

Building Code Lens from scratch (without frameworks) taught us:

### 1. What Embeddings Really Are
Every piece of code gets converted into a list of numbers (e.g. 3072 numbers). Similar code = similar numbers. This is how the system understands *meaning*, not just words.

```
"login function"      → [0.2, 0.9, 0.1, ...]
"authenticate user"   → [0.2, 0.8, 0.1, ...]  ← similar!
"calculate tax"       → [0.9, 0.1, 0.7, ...]  ← different!
```

### 2. Why Chunking Matters
LLMs can't read an entire codebase at once. We split files into 100-line chunks so:
- The LLM only receives *relevant* code
- Less confusion = better answers
- Metadata (file name, line numbers) added to each chunk for context

### 3. How Vector Search Works
Instead of keyword search, ChromaDB finds chunks whose *meaning* is closest to your question using mathematical distance between vectors.

### 4. Prompt Engineering
The quality of your prompt = quality of answer. We learned to:
- Give the LLM a clear role ("You are Code Lens, an expert software engineer")
- Inject relevant context (the retrieved code chunks)
- Give specific instructions ("reference file names and line numbers")
- Add honesty constraints ("if not in the code, say so")

### 5. Real API Engineering
- Handling rate limits gracefully with retry logic
- Debugging API quota issues
- Checking available models before using them
- Separating concerns (embeddings vs generation)

### 6. System Design
- Why we separate ingestion (one-time) from querying (per question)
- Why a clean agent class hides complexity
- Why an Express backend separates UI from AI logic

---

## Tech Stack & Why We Chose It

### Language: Node.js + TypeScript
| Why TypeScript over JavaScript? |
|---|
| Catches errors while coding, not at runtime |
| `filePath: string` prevents passing wrong types |
| Better for larger, multi-file projects |
| Industry standard for production AI apps |

### LLM: Groq (llama-3.3-70b-versatile)
| Why Groq? |
|---|
| Free tier with no daily limits on generation |
| Fastest inference available |
| 70B parameter model — very smart |
| Easy to swap out for any other LLM later |

> **Why not Gemini for generation?**
> Gemini free tier has a `limit: 0` issue for generateContent on new accounts. Groq works instantly.

### Embeddings: Gemini (gemini-embedding-001)
| Why Gemini for embeddings? |
|---|
| 3072 dimensions — very high quality |
| Free tier (1000 requests/day) |
| Already installed via `@google/generative-ai` |
| No extra package needed |

> **Why not local embeddings (@xenova/transformers)?**
> Corporate network SSL certificate issues blocked the download of `sharp` (a dependency). Gemini embeddings work without any downloads.

### Vector Database: ChromaDB
| Why ChromaDB? |
|---|
| Open source and free |
| Easy to run locally |
| Simple Node.js client |
| Persists data between runs |
| Industry standard for RAG systems |

> **Why not FAISS?**
> FAISS has no UI and is harder to inspect. ChromaDB has better tooling and is easier to debug.

### Backend: Express.js
| Why Express? |
|---|
| Familiar JavaScript/Node.js |
| Minimal setup |
| Easy to add endpoints |
| Connects React UI to Code Lens agent |

### Frontend: React + Vite + TypeScript
| Why React? |
|---|
| Already familiar from frontend work |
| Fast to build with |
| Vite makes setup instant |
| Component-based = easy to extend per phase |

---

## Project Roadmap

```
Phase 1 → Code Lens (Codebase Explainer)    ✅ CURRENT
Phase 2 → Copilot (Code suggestions)
Phase 3 → QA Generator (Auto test writing)
Phase 4 → Debug Agent (Error fixing)
Phase 5 → Memory Layer (Learn over time)
Phase 6 → Orchestrator (Multi-agent manager)
Phase 7 → Performance + Dependency Agents
```

Each phase builds on Phase 1. The RAG foundation powers everything.

---

## File Structure

```
engineer-ai/
│
├── src/                          # All backend TypeScript source
│   ├── ingestion/
│   │   ├── fileLoader.ts         # Reads all code files from folder or single file
│   │   └── chunker.ts            # Splits files into chunks with metadata
│   │
│   ├── embeddings/
│   │   └── embedder.ts           # Converts chunks to vectors via Gemini
│   │
│   ├── vectorstore/
│   │   └── chromaStore.ts        # Stores vectors + similarity search
│   │
│   ├── llm/
│   │   ├── gemini.ts             # Gemini LLM wrapper (for when quota allows)
│   │   └── groq.ts               # Groq LLM wrapper (currently active)
│   │
│   ├── agent/
│   │   └── explainAgent.ts       # Code Lens agent — orchestrates full RAG pipeline
│   │
│   ├── store/
│   │   └── pathStore.ts          # Persists ingested paths to disk (JSON)
│   │
│   ├── index.ts                  # CLI entry point
│   ├── server.ts                 # Express API server
│   ├── checkChroma.ts            # Utility: inspect ChromaDB contents
│   ├── testModels.ts             # Utility: list available Gemini models
│   └── testGroqModels.ts         # Utility: list available Groq models
│
├── ui/                           # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx               # Main chat interface
│   │   └── App.css               # Dark theme styles
│   └── package.json
│
├── chromadb/                     # ChromaDB persistent data (auto-created)
├── ingested-paths.json           # Saved ingestion history (auto-created)
│
├── .env                          # API keys (never commit this!)
├── .gitignore                    # Ignores node_modules, .env, chromadb
├── package.json                  # Dependencies + scripts
└── tsconfig.json                 # TypeScript configuration
```

---

## How Each File Works

### `fileLoader.ts`
**Job:** Walk into any folder OR read a single file, return a list of code files.

**Key decisions:**
- Accepts both file paths AND folder paths
- Skips `node_modules`, `.git`, `dist`, `.next`, `build`, `coverage`
- Supports `.ts`, `.js`, `.tsx`, `.jsx`, `.py`, `.java`, `.html`, `.css`, `.json`, `.md`
- Wraps everything in try/catch — unreadable files are skipped with a warning
- Returns `{ filePath, content, extension }` for each file

### `chunker.ts`
**Job:** Split each file into 100-line chunks with overlap and metadata.

**Key decisions:**
- `CHUNK_SIZE = 100` — not too big (confuses LLM), not too small (loses context)
- `OVERLAP = 15` — shared lines between chunks preserve context at boundaries
- Adds metadata to every chunk: `File: x | Language: y | Lines: a-b`
- This metadata tells the LLM exactly where the code came from

### `embedder.ts`
**Job:** Convert each chunk into a vector (list of 3072 numbers).

**Key decisions:**
- Uses Gemini `gemini-embedding-001` model
- Rate limit handling: 500ms delay between requests, 60s pause every 20 chunks
- Retry logic: 3 retries with 30s wait on failure
- Processes one chunk at a time to avoid burst limits

### `chromaStore.ts`
**Job:** Store vectors + search for similar ones.

**Key functions:**
- `initCollection()` — opens/creates the ChromaDB collection
- `storeChunks()` — saves embeddings + code + metadata
- `searchSimilarChunks()` — finds top-K most relevant chunks for a question
- `resetCollection()` — clears all data (for fresh ingestion)
- `collectionExists()` — checks if data already exists (skip re-embedding)

### `groq.ts`
**Job:** Send question + relevant code chunks to Groq LLM, get explanation back.

**Key decisions:**
- Uses `llama-3.3-70b-versatile` — best free model available on Groq
- Prompt engineering: role + context + question + instructions
- `NODE_TLS_REJECT_UNAUTHORIZED = "0"` — bypasses corporate SSL (dev only!)

### `explainAgent.ts` — Code Lens Agent
**Job:** Orchestrate the full RAG pipeline behind a clean interface.

```typescript
const codeLens = new ExplainAgent();
await codeLens.ingest("./my-project");    // one-time setup
const answer = await codeLens.ask("..."); // ask anything
```

**Key decisions:**
- `isIngested` flag prevents asking before ingestion
- `collectionExists()` check skips re-embedding if data already in ChromaDB
- Hides all complexity — caller doesn't need to know about chunks or vectors

### `pathStore.ts`
**Job:** Save ingested paths to disk so they survive server restarts.

**Key functions:**
- `addIngestedPath()` — saves a path after successful ingestion
- `getIngestedPaths()` — returns all saved paths (shown in UI history table)
- `getActivePath()` — returns last active path (for auto-restore on restart)
- `wasIngested()` — checks if a path was previously ingested

### `server.ts`
**Job:** Express API that connects the React UI to the Code Lens agent.

**Auto-restore on restart:** On every server start, checks `pathStore` for the last active path. If ChromaDB has data, marks as ready instantly — no re-embedding needed.

---

## Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Node.js | 18+ | `node -v` |
| Python | 3.8+ | `python --version` |
| npm | 9+ | `npm -v` |
| VS Code | Any | Recommended editor |

### API Keys needed:
| Service | Free Tier | Get it at |
|---|---|---|
| Google AI Studio (Gemini) | 1000 embeddings/day | aistudio.google.com |
| Groq | Generous free tier | console.groq.com |

---

## Installation

### Step 1: Install backend dependencies
```bash
npm install
```

### Step 2: Install frontend dependencies
```bash
cd ui
npm install
cd ..
```

### Step 3: Install ChromaDB
```bash
pip install chromadb
```

### Step 4: Set up environment variables
Create a `.env` file in the root:
```
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
```

> ⚠️ Never commit `.env` to GitHub. It's already in `.gitignore`.

---

## How to Run

You need **3 terminals** running simultaneously:

### Terminal 1 — ChromaDB (Database)
```bash
chroma run --path ./chromadb
```
Expected output:
```
Connect to Chroma at: http://localhost:8000
```

### Terminal 2 — Backend (Code Lens Agent + API)
```bash
npm run server
```
Expected output:
```
⚙️ Engineer AI — Code Lens
📡 Server running at http://localhost:3001
```

### Terminal 3 — Frontend (React UI)
```bash
cd ui
npm run dev
```
Expected output:
```
➜  Local:   http://localhost:5173/
```

### Then open your browser:
```
http://localhost:5173
```

1. Enter your codebase path (e.g. `C:/Projects/my-app/src`)
2. Click **⚡ Ingest** — wait for completion
3. Ask anything about your codebase!

> 💡 **Tip:** After the first ingest, the server remembers your path. On restart it auto-restores without re-embedding.

---

## Package.json Scripts

```json
"scripts": {
  "start": "ts-node src/index.ts",
  "server": "ts-node src/server.ts"
}
```

| Script | Command | What it does |
|---|---|---|
| `npm start` | `ts-node src/index.ts` | Runs CLI version (asks hardcoded questions) |
| `npm run server` | `ts-node src/server.ts` | Starts Express API for the React UI |

### UI Scripts (run from `ui/` folder):

| Script | Command | What it does |
|---|---|---|
| `npm run dev` | `vite` | Starts React dev server at localhost:5173 |
| `npm run build` | `vite build` | Builds production React app |
| `npm run preview` | `vite preview` | Previews production build locally |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | For embeddings (gemini-embedding-001) |
| `GROQ_API_KEY` | ✅ Yes | For LLM generation (llama-3.3-70b-versatile) |

---

## Issues Faced & Solutions

### 1. PowerShell doesn't support Linux commands
**Error:** `mkdir -p` not recognized
**Solution:** Use PowerShell equivalents:
```powershell
# Instead of: mkdir -p src/ingestion
mkdir src
mkdir src\ingestion

# Instead of: rmdir /s /q chromadb
Remove-Item -Recurse -Force chromadb
New-Item -ItemType Directory -Name chromadb
```

### 2. TypeScript can't find `fs` or `path` modules
**Error:** `Cannot find module 'fs'`
**Solution:** Add `"types": ["node"]` to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### 3. Gemini embedding model not found (404)
**Error:** `models/text-embedding-004 is not found`
**Solution:** Check available models first:
```bash
npx ts-node src/testModels.ts
```
Use only models from the list. We use `gemini-embedding-001`.

### 4. Gemini generateContent quota = 0
**Error:** `limit: 0` for generateContent free tier
**Solution:** Switched to Groq for generation. Groq is free with no such limit.

### 5. Groq SSL certificate error (corporate network)
**Error:** `unable to get local issuer certificate`
**Solution:** Add at top of `groq.ts` (dev only!):
```typescript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
```
> ⚠️ Remove this before deploying to production.

### 6. Groq model decommissioned
**Error:** `llama3-8b-8192 has been decommissioned`
**Solution:** Check available models:
```bash
npx ts-node src/testGroqModels.ts
```
Now using `llama-3.3-70b-versatile`.

### 7. ChromaDB DefaultEmbeddingFunction warning
**Error:** `Cannot instantiate collection with DefaultEmbeddingFunction`
**Solution:** This is just a warning, not an error. We provide our own Gemini embeddings so ChromaDB's default is never used. Safe to ignore.

### 8. Gemini daily quota exhausted (429)
**Error:** `1000 requests/day limit reached`
**Solution:**
- Increase `CHUNK_SIZE` to 100 in `chunker.ts` (fewer chunks = fewer requests)
- Wait for daily quota reset (~12:30 PM IST)
- Or enable billing on Google Cloud for higher limits

### 9. pip not recognized
**Error:** `pip is not recognized`
**Solution:** Install Python from python.org. During install, check **"Add Python to PATH"**. Restart VS Code after installation.

### 10. Sharp installation failed (corporate network)
**Error:** `Installation error: unable to get local issuer certificate`
**Solution:** Triggered by `@xenova/transformers`. Switched to Gemini API embeddings — no `sharp` dependency needed.

### 11. Code Lens re-embeds on every server restart
**Problem:** Every `npm run server` re-embeds everything, wasting quota
**Solution:**
- Added `collectionExists()` check in `explainAgent.ts` — skips if data exists
- Added `pathStore.ts` — saves paths to disk, auto-restores on restart

### 12. Stale ChromaDB data from old project
**Problem:** Code Lens answered questions about itself instead of the new project
**Solution:** Click 🔄 Reset in the UI, or manually:
```powershell
Remove-Item -Recurse -Force chromadb
New-Item -ItemType Directory -Name chromadb
```

### 13. ENOTDIR error on file paths
**Error:** `ENOTDIR: not a directory, scandir '...Modal.jsx'`
**Solution:** Updated `fileLoader.ts` to:
- Check `stat.isFile()` explicitly before reading
- Wrap `statSync` in try/catch to skip unreadable paths
- Skip symbolic links with `stat.isSymbolicLink()`
- Accept both file paths AND folder paths as input

---

## API Endpoints

Base URL: `http://localhost:3001`

### POST `/ingest`
Ingests a codebase into ChromaDB.
```json
// Request
{ "folderPath": "C:/Projects/my-app/src" }

// Response
{ "success": true, "message": "Codebase ingested successfully!", "paths": [...] }
```

### POST `/ask`
Asks a question about the ingested codebase.
```json
// Request
{ "question": "How does authentication work?" }

// Response
{ "answer": "Authentication is handled by..." }
```

### POST `/reset`
Clears ChromaDB for fresh ingestion.
```json
// Response
{ "success": true, "message": "Codebase cleared. You can ingest again." }
```

### GET `/paths`
Returns all previously ingested paths.
```json
// Response
{ "paths": [{ "folderPath": "...", "ingestedAt": "..." }] }
```

### GET `/health`
Checks server + agent status.
```json
// Response
{ "status": "⚙️ Engineer AI — Code Lens is running", "isReady": true, "activePath": "..." }
```

---

## Future Phases

### Phase 2 — Copilot
Suggest code completions and refactors based on your codebase patterns.

### Phase 3 — QA Generator
Input any function → output unit tests automatically.

### Phase 4 — Debug Agent
Input an error or stack trace → get a fix suggestion with full explanation.

### Phase 5 — Memory Layer
Store past bugs, fixes, and patterns so Engineer AI learns over time.

### Phase 6 — Orchestrator
A manager agent that coordinates all specialized agents:
```
User: "This feature is slow and sometimes failing"
Orchestrator → calls Debug Agent + Performance Agent + QA Agent
             → combines results into one unified answer
```

### Phase 7 — Performance + Dependency Agents
- Identify performance bottlenecks in code
- Analyze npm/pip dependencies for security risks and outdated packages

---

## Architecture Overview

```
User / React UI (localhost:5173)
           ↓
    Express Server (localhost:3001)
           ↓
     Code Lens Agent (explainAgent.ts)
           ↓
    ┌──────────────────────────────┐
    │  Ingestion Pipeline          │
    │  fileLoader → chunker        │
    │           → embedder         │
    └──────────────────────────────┘
           ↓
    ┌──────────────────────────────┐
    │  ChromaDB (localhost:8000)   │
    │  store + similarity search   │
    └──────────────────────────────┘
           ↓
    ┌──────────────────────────────┐
    │  Groq LLM                    │
    │  llama-3.3-70b-versatile     │
    └──────────────────────────────┘
           ↓
        Answer
```

---

*⚙️ Engineer AI — Built agent by agent, phase by phase.*
*🔱 Powered by the spirit of ISKANDA — The Strategic Commander of Code.*