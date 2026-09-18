# StudyFlow AI — Development Prompts Catalog

This document details the actual system and engineering prompts utilized in designing, constructing, testing, and evaluating the **StudyFlow AI** platform.

---

## 1. System Architecture & Domain Modeling Prompts

### Prompt: Relational Schema & State Representation
```text
Design a normalized relational database schema in Node.js for an AI Study Companion supporting:
1. Multi-space and multi-project hierarchy with strict isolation.
2. Materials, PDF page mapping, and searchable knowledge chunk representation.
3. Persistent concept mastery with historical snapshot tracking and growth status (Improving, Stable, Requiring Attention).
4. Adaptive quizzes, MCQ options, open-ended rubrics, and detailed AI evaluations.
5. Actionable next-step recommendations and platform-wide learning event streams.
6. AI telemetry logs (model, feature, latency ms, token counts, cost $, grounding flags).
7. Asynchronous background queue job states (QUEUED, PROCESSING, EXTRACTING, INDEXING, READY, FAILED) with retry limits.
```

---

## 2. Grounded AI Tutor & Citation Prompts

### System Prompt: Grounded AI Tutor
```text
You are an expert, supportive AI Study Companion and personal tutor.
Your current project workspace is "${project.name}".
The student's goal is: "${project.learningGoal}".
Known student weaknesses: ${learnerContext.weakConcepts.join(', ') || 'None identified yet'}.
Known student strengths: ${learnerContext.strongConcepts.join(', ') || 'None identified yet'}.

Core Principles:
1. Context First: Prioritize the student's project materials.
2. Grounded Citations: When using facts from the materials, cite the exact source and page in brackets like [Source: Document Title — Page X].
3. Evidence Over Guessing: If the materials lack sufficient evidence, do not invent answers.
```

### Prompt: Unsupported Question Refusal Guardrail
```text
User question: "${message}"

Notice: Insufficient evidence in project materials. Formulate a polite refusal explaining that the uploaded documents for "${project.name}" do not contain information on this topic, and suggest uploading relevant materials or opting in to general AI explanation.
```

---

## 3. Adaptive Assessment & AI Rubric Grading Prompts

### Prompt: Adaptive Question Generator
```text
Generate an adaptive ${difficulty} ${questionType} assessment question for the concept "${concept.name}".
Context from project notes: ${referenceContext || concept.description}

Output pure JSON format:
{
  "prompt": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why Option A is correct based on theory."
}
```

### Prompt: Open-Ended 5-Dimension Rubric Grader
```text
Evaluate the student's answer to this open-ended learning question.
Question: "${questionPrompt}"
Target Concept: "${conceptName}"
Student Answer: "${userAnswer}"

Evaluate strictly on:
1. Understanding (0-100)
2. Accuracy (0-100)
3. Key Concepts covered (list)
4. Missing Concepts or misconceptions (list)
5. Overall score (0-100)

Output pure JSON format:
{
  "score": 85,
  "understanding": "Clear qualitative explanation of ...",
  "accuracy": "Accurate description of ...",
  "keyConceptsCovered": ["Concept A", "Concept B"],
  "missingConcepts": ["Did not mention edge case X"],
  "reasoningScore": 88
}
```

---

## 4. Frontend & User Experience Design Prompts

### Prompt: Modern Glassmorphic Workspace Design System
```text
Create a modern, high-contrast, luminous dark-mode design system in Tailwind CSS for an AI learning companion:
- Deep space palette (#080c14, #111827) with indigo, emerald, amber, and rose accents.
- Modern typography pairing (Inter / Plus Jakarta Sans).
- Reusable glass-card and glass-panel frosted blur utilities with subtle glowing borders.
- Interactive SVG Concept Knowledge Graph with dynamic color-coded node mastery.
- 3D interactive flashcards powered by SuperMemo SM-2 spaced repetition algorithms.
```

---

## 5. Automated AI Evaluation & Benchmark Testing Prompts

### Prompt: Groundedness Benchmark Runner
```text
Run automated regression benchmarks across 3 key AI features:
1. Groundedness & Citation Accuracy against verified gold-standard PDF document chunks.
2. Unsupported Question Refusal to verify 0% hallucination on out-of-domain topics.
3. Open-Ended Rubric Grading Quality comparing AI scoring against pedagogical ground-truth rubrics.
Calculate pass rate %, mean latency (ms), and store telemetry traces for audit.
```
