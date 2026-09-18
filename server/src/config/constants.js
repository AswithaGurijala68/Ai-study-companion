// Model definitions, pricing metrics, and learning constants
module.exports = {
  PORT: process.env.PORT || 5000,
  
  // AI Pricing (per 1,000,000 tokens in USD)
  MODEL_PRICING: {
    'gemini-1.5-flash': { promptCostPerM: 0.075, completionCostPerM: 0.30 },
    'gemini-1.5-pro': { promptCostPerM: 3.50, completionCostPerM: 10.50 },
    'built-in-local-engine': { promptCostPerM: 0.00, completionCostPerM: 0.00 },
    'gpt-4o': { promptCostPerM: 5.00, completionCostPerM: 15.00 }
  },

  DEFAULT_MODEL: 'gemini-1.5-flash',
  FALLBACK_MODEL: 'built-in-local-engine',

  // Mastery Calculation Constants
  MASTERY_WEIGHTS: {
    MCQ_CORRECT: 12,
    MCQ_INCORRECT: -8,
    OPEN_ENDED_HIGH: 20,    // Score >= 85
    OPEN_ENDED_MEDIUM: 8,   // Score 60 - 84
    OPEN_ENDED_LOW: -10,    // Score < 60
    TUTOR_ENGAGEMENT: 2     // Interacting with concept in tutor chat
  },

  MASTERY_THRESHOLDS: {
    IMPROVING_DELTA: 5,     // Delta over last 3 updates >= +5%
    NEEDS_ATTENTION_SCORE: 60, // Below 60% mastery
    STABLE_BAND: 4          // Within +/- 4%
  },

  // Document Processing States
  JOB_STATUS: {
    QUEUED: 'QUEUED',
    PROCESSING: 'PROCESSING',
    EXTRACTING: 'EXTRACTING',
    INDEXING: 'INDEXING',
    READY: 'READY',
    FAILED: 'FAILED'
  },

  // Max Retries for background jobs
  MAX_JOB_RETRIES: 3,
  
  // Chunking parameters
  CHUNK_SIZE: 500, // words
  CHUNK_OVERLAP: 80 // words
};
