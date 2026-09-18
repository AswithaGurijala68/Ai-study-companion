# StudyFlow AI — Known Limitations & Future Work

As required by Section 20 (Items 8 & 9) of the Product Requirements Document (Version 3.0), this document candidly outlines the engineering tradeoffs, current limitations, and proposed future roadmap for the **StudyFlow AI** platform.

---

## 1. Known Limitations

### A. Document Understanding & Parsing
- **Complex Multi-Column & Mathematical OCR**: The current prototype employs a fast structured paragraph and section extractor. For heavily stylized academic PDFs with dual-column layouts, embedded LaTeX vector figures, or scanned handwritten notes, full multimodal vision-based OCR (e.g. Gemini 1.5 Flash Vision / Nougat) would provide higher extraction fidelity.
- **Table & Chart Understanding**: Tables are currently parsed into plain structured text chunks. Relational understanding of large data tables or multi-axis charts is simplified.

### B. Retrieval & Semantic Search
- **Hybrid Vector + Keyword Search**: The current retrieval engine utilizes TF-IDF / BM25 token weighting with concept boosting and confidence scoring in-memory. For scaling to millions of documents, integration with a distributed vector database (e.g. Pinecone, Qdrant, or pgvector) with dense embeddings (e.g. `text-embedding-004`) would be recommended.
- **Cross-Lingual Retrieval**: The prototype is optimized for English-language documents; multilingual cross-lingual matching is not explicitly calibrated.

### C. Background Processing & Distributed Scaling
- **In-Process Worker Queue**: The background processing engine runs in-process with asynchronous timers, retries, and persistence to the local JSON store. In an enterprise multi-node deployment, an external distributed queue (such as Redis BullMQ, RabbitMQ, or Google Cloud Pub/Sub with Cloud Tasks) would be used.

### D. Security & Multi-Tenancy
- **Authentication**: The prototype uses password authentication with signed bearer tokens and browser token persistence. Production deployments should add refresh-token/session management, password reset, email verification, rate limiting, MFA where appropriate, and managed identity infrastructure.

---

## 2. Future Improvements Roadmap

### Phase 1: Real-Time Multimodal & Voice Interaction
- **Bidirectional Voice Tutoring**: Integration with the Gemini Live API for real-time, low-latency conversational audio tutoring with native interruption handling.
- **Inline Math & LaTeX Equation Solver**: Interactive math canvas allowing learners to sketch equations and receive step-by-step guidance.

### Phase 2: Collaborative Learning Spaces & Peer Reviews
- **Shared Study Spaces**: Enable study groups, classrooms, and teams to collaborate within a shared Space while maintaining individual concept mastery profiles.
- **Peer Quiz Challenges**: Adaptive multiplayer quiz battles where question difficulty scales dynamically based on both learners' relative mastery gaps.

### Phase 3: Advanced Cognitive Models & Spaced Retention
- **Forgetting Curve Modeling (FSRS)**: Upgrade the current SuperMemo SM-2 flashcard scheduler to the Free Spaced Repetition Scheduler (FSRS) with personalized memory stability decay parameters.
- **Automated Socratic Dialogue Engine**: AI Tutor proactively initiates check-in questions when a student exhibits a pattern of repeated misconceptions in past quiz attempts.

### Phase 4: Production Enterprise Infrastructure
- **Distributed Vector Indexing**: pgvector / Cloud Spanner Graph integration.
- **Automated Synthetic Benchmark Generation**: Continuously generate golden regression datasets from newly uploaded textbooks to validate grounding quality across prompt iterations.


## Deployment and storage limitation
This challenge build intentionally uses a local JSON data store and local upload directory instead of a managed database/object store. It is appropriate for a small prototype but is not durable storage on typical ephemeral cloud hosts. A production deployment should use a managed database and object storage.

## Authentication
The prototype now uses password authentication with signed bearer tokens stored by the browser. It is intentionally lightweight; a production system should add refresh-token/session management, password reset, email verification, rate limiting, MFA where appropriate, and a managed secret/session strategy.
