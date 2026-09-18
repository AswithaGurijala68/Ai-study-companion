const db = require('../db/database');

const STOP_WORDS = new Set([
  'the', 'and', 'with', 'from', 'what', 'when', 'how', 'why', 'where', 'who', 'which',
  'is', 'are', 'was', 'were', 'for', 'that', 'this', 'these', 'those', 'in', 'on', 'at',
  'to', 'of', 'a', 'an', 'by', 'as', 'it', 'its', 'or', 'be', 'can', 'you', 'your', 'does', 'do'
]);

class RetrievalEngine {
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_\-\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  calculateTFIDF(queryTokens, chunkText, chunkConcepts = []) {
    const chunkTokens = this.tokenize(chunkText);
    if (chunkTokens.length === 0 || queryTokens.length === 0) return 0;

    const chunkTokenFreq = {};
    for (const t of chunkTokens) {
      chunkTokenFreq[t] = (chunkTokenFreq[t] || 0) + 1;
    }

    let score = 0;
    for (const q of queryTokens) {
      if (chunkTokenFreq[q]) {
        score += (chunkTokenFreq[q] / chunkTokens.length) * 15;
      }
      // Boost concept match
      for (const c of chunkConcepts) {
        if (c.toLowerCase().includes(q)) {
          score += 6;
        }
      }
    }

    return score;
  }

  search({ projectId, query, limit = 4 }) {
    if (!projectId || !query) {
      return { chunks: [], confidence: 0, insufficientEvidence: true };
    }

    // Strict project isolation: Only search chunks assigned to this project
    const allChunks = db.find('document_chunks', chunk => chunk.projectId === projectId);
    if (allChunks.length === 0) {
      return { chunks: [], confidence: 0, insufficientEvidence: true };
    }

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return { chunks: [], confidence: 0, insufficientEvidence: true };
    }

    const scoredChunks = allChunks.map(chunk => {
      const material = db.findById('materials', chunk.materialId);
      const score = this.calculateTFIDF(queryTokens, chunk.content, chunk.concepts || []);
      return {
        ...chunk,
        materialTitle: material ? material.title : 'Project Document',
        score: score
      };
    });

    // Filter by meaningful score threshold
    const matches = scoredChunks
      .filter(c => c.score >= 0.15)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const topScore = matches.length > 0 ? matches[0].score : 0;
    const confidence = Math.min(100, Math.round(topScore * 14));
    const insufficientEvidence = matches.length === 0 || topScore < 0.25;

    return {
      chunks: matches,
      topScore,
      confidence,
      insufficientEvidence
    };
  }
}

const retrievalEngine = new RetrievalEngine();
module.exports = retrievalEngine;
