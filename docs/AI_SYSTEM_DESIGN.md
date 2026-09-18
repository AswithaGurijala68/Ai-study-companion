# StudyFlow AI — AI System Design, Grounding & Evaluation

This document outlines the AI engineering architecture, prompt engineering strategies, strict grounding mechanisms, unsupported-question refusal guardrails, adaptive assessment psychometrics, and automated evaluation suites.

---

## 1. Grounding & Evidence Verification Strategy

To fulfill the PRD's **"Evidence Over Guessing"** mandate, the AI Tutor does not rely on unrestricted base knowledge for project-specific questions. Instead, it employs a 5-stage Grounding & Retrieval pipeline:

```
[User Query] ──➔ [Project Tokenizer] ──➔ [TF-IDF / BM25 Concept Matching]
                                                 │
                                                 ▼
[Confidence Evaluator] ◄── [Scored Document Chunks with Page Numbers]
        │
   ┌────┴────────────────────────┐
   ▼                             ▼
[Confidence >= 0.25]        [Confidence < 0.25 / Out of Scope]
   │                             │
   ▼                             ▼
[Grounded Prompt Composition]  [Refusal / Evidence Disclaimer Guardrail]
```

### Context Composition Structure
Every prompt submitted to the LLM (Gemini 1.5 Flash / Pro or Local Reasoner) incorporates 3 distinct layers:
1. **Persistent Learner Context**: Student's active goal, known weaknesses, and concepts needing attention.
2. **Project-Isolated Knowledge Chunks**: Top retrieved snippets formatted with explicit document metadata:
   ```
   [Document 1: Transformer_Guide.pdf | Page 3 | Section: Scaled Dot-Product Attention]
   Scaled Dot-Product Attention computes the compatibility of Query (Q) and Key (K) vectors...
   ```
3. **Grounding Directives**: Strict system prompt instructing the model to quote facts only from the provided snippets and format citations as `[Source: Document Title — Page X]`.

---

## 2. Unsupported Question Handling & Refusal Guardrail

If a student asks a query outside the scope of the project's uploaded materials (e.g., asking about *Internal Combustion Engines* inside a *Transformer Architecture* workspace):
1. The `RetrievalEngine` detects a low relevance confidence score (`< 0.25`).
2. The AI Tutor suppresses hallucinated answers and emits a formal **Evidence Disclaimer**:
   > *"I reviewed the uploaded materials for this project, but there is insufficient evidence to answer your question about this topic."*
3. The UI presents an interactive opt-in chip: `[Explain using General AI Knowledge]`, allowing the student to consciously branch into open-world knowledge while preserving strict learning boundaries.

---

## 3. Adaptive Assessment & 5-Dimension AI Rubric Grading

### Adaptive Question Selection
Rather than a simple `Wrong ➔ Easy / Correct ➔ Hard` binary switch, the system selects concepts based on:
- Lowest concept mastery score (prioritizing status *Requiring Attention*).
- Historical mistake frequency and time since last assessment.

### Open-Ended AI Rubric Evaluation
For open-ended conceptual explanations, the AI evaluates student submissions across 5 distinct dimensions:
1. **Understanding (0–100)**: Qualitative grasp of the underlying principle.
2. **Accuracy (0–100)**: Correctness of operational steps and equations.
3. **Key Concepts Covered (`string[]`)**: Extracted list of core terms accurately addressed.
4. **Missing Concepts (`string[]`)**: Constructive identification of omissions, boundary conditions, or misconceptions.
5. **Reasoning Score (0–100)**: Mathematical or architectural validity of the student's explanation.

---

## 4. AI Observability, Telemetry & Cost Model

Every AI interaction is logged into the `ai_logs` telemetry database with end-to-end metrics:

| Metric | Calculation / Source |
|---|---|
| **Prompt Tokens** | `Math.ceil(text.length / 3.8)` or native API metadata |
| **Completion Tokens** | `Math.ceil(completionText.length / 3.8)` |
| **End-to-End Latency** | `Date.now() - requestStartTime` (in milliseconds) |
| **Estimated Cost ($)** | Calculated using the model's USD rate per 1M tokens: <br>`(promptTokens / 1M * promptRate) + (completionTokens / 1M * completionRate)` |
| **Grounded Flag** | `Boolean`: True if verified against document chunks |
| **Trace Inspector** | Complete prompt preview, system prompt, and full response available in Admin Dashboard |

---

## 5. Automated AI Evaluation & Regression Testing

The platform includes an automated benchmark suite (`evaluationService.js`) covering 3 critical capabilities:

1. **Groundedness & Citation Accuracy**: Evaluates whether cited document titles and page numbers correspond to the true source of the underlying claim.
2. **Unsupported Question Refusal Benchmark**: Tests out-of-domain and ungrounded queries to ensure 100% adherence to the refusal guardrail.
3. **Rubric Grading Quality Benchmark**: Compares AI grading against gold-standard rubric answers to verify fair, constructive scoring.
