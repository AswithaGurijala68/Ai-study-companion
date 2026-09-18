# StudyFlow AI — Architecture & Engineering Design

This document details the architectural decisions, system boundaries, data isolation guarantees, and asynchronous background worker mechanics for **StudyFlow AI (AI Study Companion)**.

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (REACT 18 + VITE)                       │
│  - Spaces & Projects UI         - Document Uploader & Status Stepper    │
│  - Grounded AI Tutor Chat       - Adaptive Psychometric Assessment      │
│  - Dynamic Concept Mastery Grid - Interactive Concept Knowledge Map     │
│  - SM-2 Spaced Repetition Decks - Observability & Telemetry Dashboards  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP REST / SSE Stream
┌────────────────────────────────────▼────────────────────────────────────┐
│                       EXPRESS.JS APPLICATION LAYER                      │
│  - Auth & Strict Project Isolation Middleware                           │
│  - API Route Handlers (Spaces, Projects, Materials, Tutor, Quiz, Eval)  │
│  - Business Logic Services & In-Memory Relational Engine                │
└──────────┬─────────────────────────┬─────────────────────────┬──────────┘
           │                         │                         │
┌──────────▼─────────┐    ┌──────────▼─────────┐    ┌──────────▼──────────┐
│   DATABASE LAYER   │    │ ASYNC QUEUE WORKER │    │   AI REASONING BUS  │
│ - Users & Personas │    │ - Multi-Stage OCR  │    │ - Gemini API Call   │
│ - Spaces & Projects│    │ - Chunking Engine  │    │ - Fallback Engine   │
│ - Document Chunks  │    │ - Concept Vectorizer│   │ - Grounding Citations│
│ - Concept Mastery  │    │ - Mastery Recalc   │    │ - Refusal Detector  │
│ - Quiz & Attempts  │    │ - Recommendation Gen│   │ - Telemetry Logger  │
│ - AI Traces & Evals│    │ - Retry & Idempot. │    │ - Benchmark Suites  │
└────────────────────┘    └────────────────────┘    └─────────────────────┘
```

---

## 2. Structural Separation & Data Isolation

### User ➔ Spaces ➔ Projects Hierarchy
- **Space**: Represents a broad domain (e.g. *Artificial Intelligence & Machine Learning*, *Distributed Systems & Cloud*, *Biochemistry*).
- **Project**: Represents a specific, goal-oriented learning journey (e.g. *Transformers & Self-Attention Architectures*).
- **Data Isolation Guarantee**:
  1. Every document chunk, vector embedding, extracted concept, and quiz question is strictly tagged with `projectId` and `userId`.
  2. The `RetrievalEngine` filters all candidate chunks by `projectId === targetProjectId`.
  3. The `enforceProjectIsolation` middleware rejects any cross-project or cross-user query with a 403 Forbidden error.
  4. Cross-project knowledge leakage is mathematically impossible at the query layer.

---

## 3. Asynchronous Background Document Processing Pipeline

To guarantee that long-running operations do not block user interactions, documents are processed via an asynchronous job worker queue with strict stage transitions:

```
[Upload PDF/TXT]
      │
      ▼
   [QUEUED] ── (Registered in background_jobs table, worker notified)
      │
      ▼
 [PROCESSING] ── (File parsed, sections and page headers extracted)
      │
      ▼
 [EXTRACTING] ── (Entity recognition extracts domain concepts & terms)
      │
      ▼
  [INDEXING] ── (Generates search representations with exact page numbers)
      │
      ▼
   [READY] ── (Indexed into document_chunks, active for Tutor & Quizzes)
```

### Idempotency & Fault Tolerance
- **Duplicate Job Prevention**: If a job for the same entity is already `QUEUED` or `PROCESSING`, duplicate submissions are deduplicated.
- **Automatic Retries**: If a parsing worker crashes, jobs are retried up to 3 times with exponential backoff.
- **Manual Retry API**: Users can trigger `/api/materials/:id/retry` if a document fails.

---

## 4. Concept Mastery & Psychometric Scoring Engine

Concept mastery is treated as an evolving dynamic probability distribution (0–100%) rather than a static badge:

### Bayesian / Moving-Average Update Formula
```
NewMastery = Clamp(5, 99, PreviousMastery + Delta)
```
Where `Delta` is calibrated based on evidence quality:
- **Multiple Choice Correct**: `+12%`
- **Multiple Choice Incorrect**: `-8%`
- **Open-Ended High Rubric (≥85%)**: `+20%`
- **Open-Ended Medium Rubric (60-84%)**: `+8%`
- **Open-Ended Low Rubric (<60%)**: `-10%`
- **Tutor Interaction**: `+2%`

### Growth Classification
- **Improving**: Positive velocity over recent history snapshots (`score > previous + 5%` or `score >= 80%`).
- **Stable**: Mastery remains consistent within standard band.
- **Requiring Attention**: Score is below `60%` or declining.

---

## 5. Next Action Recommendation Engine

Answers the core user question: **"What should I do next?"**
1. Scans the project's concept mastery distribution for concepts in `Requiring Attention`.
2. Locates the exact source document and page number where that weak concept is explained.
3. Formulates a targeted intervention with a one-click CTA (e.g., `Start 3-Question Practice Quiz` or `Read Page 14 of Transformer Guide.pdf`).
