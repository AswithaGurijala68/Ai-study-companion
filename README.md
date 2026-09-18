# StudyFlow AI — AI Study Companion & Growth Workspace

> **A persistent, contextual, and measurable AI learning partner that connects study materials, grounded tutoring, adaptive quizzes, dynamic concept mastery, and growth recommendations into one unified experience.**

---

## 🌟 Overview & Core Principles

Traditional learning tools often treat AI as a disconnected chatbot that loses context, invents ungrounded answers, and fails to measure true understanding. **StudyFlow AI** solves this by implementing an end-to-end persistent learning loop:

```
Create Space ➔ Create Project ➔ Add Learning Material (Real PDF/Notes) ➔ Async Knowledge Processing 
       ➔ Learn with Grounded AI Tutor ➔ Exact Page Citations & Unsupported Question Handling 
       ➔ Take Adaptive Quiz ➔ 5-Dimension Rubric Grading ➔ Dynamic Mastery & Growth 
       ➔ Actionable Recommendation ("What to do next?") ➔ Continuous Mastery
```

### Key Capabilities
- **Strict Data & Context Isolation**: Spaces (broad domains) and Projects (focused journeys) maintain strict contextual separation.
- **Page-Aware PDF & Document Pipeline**: Native PDF parsing (`pdf-parse`) and page-by-page mapping with multi-stage background worker processing (`Queued → Parsing/OCR → Chunking & Concept Extraction → Indexing → Ready`).
- **Grounded AI Tutor with Exact Citations**: Answers are grounded in uploaded project materials with exact page numbers (e.g. `[Source: Guide.pdf — Page 14]`) and clickable quote inspectors.
- **Unsupported Question Handling**: When evidence is missing from project documents, the Tutor refuses to speculate, informs the user, and transparently offers the **General AI Knowledge** option.
- **Multi-Turn Tutor Continuity**: Retains conversation history and user mastery state across turns for consistent, personalized dialogue.
- **Adaptive Quiz & 5-Dimension Rubric Grading**: Calibrates difficulty and concept selection targeting the student's weakest areas and mistake history. AI grades open-ended answers with detailed pedagogical feedback on understanding, accuracy, covered concepts, and missing elements.
- **Dynamic Concept Mastery (0–100%)**: Tracks Bayesian/moving-average mastery scores categorized as *Improving*, *Stable*, or *Requiring Attention*.
- **Admin Observability & AI Telemetry**: Live platform dashboard tracking model selection, latency (ms), token usage (prompt/completion), estimated costs ($), background queue monitor, learner journey inspector, and automated benchmark regression suites.
- **Differentiation & Creative Tools**: Interactive 2D Concept Knowledge Graph / Mind Map, SuperMemo SM-2 Spaced Repetition Flashcards, and AI Study Plan Roadmaps.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Canvas / SVG Visualizations, Vite.
- **Backend**: Node.js & Express.js REST API with asynchronous background worker queue.
- **AI Service Layer**: Provider abstraction supporting Google Gemini API (`gemini-1.5-flash`, `gemini-1.5-pro`) and an intelligent Built-in Local Engine for 100% out-of-the-box zero-setup execution.
- **Database & Storage**: In-memory relational database with ACID persistence to JSON store (`data_store.json`), pre-seeded with rich sample spaces (Deep Learning, Distributed Cloud Systems, Biochemistry).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```
*Backend runs on `http://localhost:5000` with health check at `http://localhost:5000/health`.*

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 3. Run Automated Backend & AI Test Suite
```bash
# From server directory:
npm test
# Or from root directory:
node tests/run-tests.js
```

---

## 🧪 Testing & Evaluation Benchmarks

Run the automated test runner (`node tests/run-tests.js`) to verify:
1. **API & Isolation Security Suite**: Tests data boundaries and user permission separation.
2. **Tutor Grounding, Citations & Refusal Suite**: Tests source citation generation, page references, and out-of-domain query refusals.
3. **Adaptive Quiz, Rubric Grading & Mastery Suite**: Tests question generation, open-ended rubric AI grading, and mastery updates.
4. **Full E2E Learning Loop & Real PDF Suite**: End-to-end integration test creating a Space/Project, generating a real multi-page PDF, processing chunks, asking the Tutor, testing grounded answers and citations, testing unsupported queries, testing General AI Knowledge, generating adaptive quizzes, grading answers, updating mastery, and generating actionable recommendations.

---

## 📚 Documentation Links
- [System Architecture (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)
- [AI System Design & Evaluation (docs/AI_SYSTEM_DESIGN.md)](docs/AI_SYSTEM_DESIGN.md)
- [Development Prompts Catalog (docs/DEVELOPMENT_PROMPTS.md)](docs/DEVELOPMENT_PROMPTS.md)
- [Limitations & Future Work (docs/LIMITATIONS_AND_FUTURE_WORK.md)](docs/LIMITATIONS_AND_FUTURE_WORK.md)
- [Demo Video Walkthrough Script (docs/DEMO_VIDEO_SCRIPT.md)](docs/DEMO_VIDEO_SCRIPT.md)


## Deployment

The prototype keeps its intentionally lightweight JSON file database in `server/src/db/data_store.json`; no external database service is required. For a public prototype, deploy the Node server together with the built React client.

### Render
1. Push this repository to GitHub.
2. Create a new Web Service on Render and select the repository.
3. Render can use the included `render.yaml`, or use:
   - Build: `npm ci --prefix client && npm run build --prefix client && npm ci --prefix server --omit=dev`
   - Start: `node server/server.js`
   - Health check: `/health`
4. Set `GEMINI_API_KEY` if you want live Gemini responses. `AUTH_SECRET` should be a strong random secret; the Blueprint generates one automatically.

### Docker
Build and run the included image:

```bash
docker build -t studyflow-ai .
docker run --rm -p 5000:5000 -e AUTH_SECRET="change-me" -e GEMINI_API_KEY="your-key" studyflow-ai
```

The production build is served by the Node server, so the deployed application uses one public URL for both the React UI and `/api`.

### Demo accounts
- Student: `alex.chen@learn.ai` / `study123`
- Admin: `admin@system.ai` / `admin123`

Change demo credentials before using the application beyond a challenge/demo environment.

### Prototype storage note
The JSON store is suitable for this challenge's lightweight prototype and is intentionally retained instead of adding a hosted database. On platforms with ephemeral disks, uploaded files and runtime JSON changes may be lost after a restart/redeploy. A production version should move persistence and document storage to durable managed services.
