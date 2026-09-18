const { v4: uuidv4 } = require('uuid');

function getSeedData() {
  const userId = 'user-1';
  const adminId = 'admin-1';

  const space1Id = 'space-ai';
  const space2Id = 'space-cloud';
  const space3Id = 'space-bio';

  const project1Id = 'proj-transformers';
  const project2Id = 'proj-diffusion';
  const project3Id = 'proj-raft';

  const doc1Id = 'doc-transformers-guide';
  const doc2Id = 'doc-flash-attn';

  return {
    users: [
      {
        id: userId,
        name: 'Alex Chen',
        email: 'alex.chen@learn.ai',
        role: 'student',
        passwordHash: 'scrypt$7a222ba1d927f9671ae9568383cefce7$3cdd4490ded7c75bed52a3604539d6ebae5d2c3c745067403aefe6750028fed4dc8e151f9613c1a311bb7f54f7eff68c39f4729cd7898ba8bc238827b3cb8f84',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: adminId,
        name: 'Dr. Elena Rostova',
        email: 'admin@system.ai',
        role: 'admin',
        passwordHash: 'scrypt$a73ccf555ad57ac31d4c1f0191fa0a30$85d5978a75304f6d9d69e5c8f301ec2fbb9d30a02f45a6ad79e74307ab4b5581a308cd46e47d2efd6469ece1f1f1f5846d28951d773f7053311895ec0ee41c7f',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      }
    ],

    spaces: [
      {
        id: space1Id,
        userId: userId,
        name: 'Artificial Intelligence & Machine Learning',
        description: 'Modern foundation models, deep architectures, attention mechanisms, and practical AI system engineering.',
        icon: 'Brain',
        color: 'indigo',
        tags: ['AI', 'Deep Learning', 'Transformers', 'NLP'],
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: space2Id,
        userId: userId,
        name: 'Distributed Systems & Cloud Architecture',
        description: 'Large-scale consensus algorithms (Raft, Paxos), fault-tolerant data stores, and high-throughput microservices.',
        icon: 'Server',
        color: 'emerald',
        tags: ['Distributed Systems', 'Cloud', 'Raft', 'Scalability'],
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: space3Id,
        userId: userId,
        name: 'Biochemistry & Cellular Genetics',
        description: 'Molecular biology, protein 3D folding pathways, RNA transcription mechanisms, and enzyme kinetics.',
        icon: 'Dna',
        color: 'rose',
        tags: ['Biology', 'Genetics', 'Proteins'],
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ],

    projects: [
      {
        id: project1Id,
        userId: userId,
        spaceId: space1Id,
        name: 'Transformers & Self-Attention Architectures',
        description: 'Deep dive into Scaled Dot-Product Attention, Multi-Head projection math, Rotary Positional Embeddings (RoPE), and KV Cache optimization.',
        learningGoal: 'Master the mathematical foundations and memory complexities of Transformer self-attention and inference optimization.',
        targetMastery: 90,
        status: 'active',
        createdAt: new Date(Date.now() - 9 * 86400000).toISOString()
      },
      {
        id: project2Id,
        userId: userId,
        spaceId: space1Id,
        name: 'Diffusion Models & Latent Generative AI',
        description: 'Understanding forward noising processes, reverse denoising U-Nets, and Classifier-Free Guidance (CFG).',
        learningGoal: 'Understand score-based generative modeling and latent diffusion implementations.',
        targetMastery: 85,
        status: 'active',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: project3Id,
        userId: userId,
        spaceId: space2Id,
        name: 'Raft Consensus & Replicated State Machines',
        description: 'Leader election, log replication, safety guarantees, and membership changes in distributed databases.',
        learningGoal: 'Implement a fault-tolerant distributed key-value store powered by Raft.',
        targetMastery: 90,
        status: 'active',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ],

    materials: [
      {
        id: doc1Id,
        userId: userId,
        projectId: project1Id,
        title: 'Transformer Architecture & Self-Attention Deep Dive.pdf',
        originalFileName: 'Transformer_Architecture_Deep_Dive.pdf',
        fileSize: 2450000,
        fileType: 'application/pdf',
        pageCount: 18,
        status: 'READY',
        progress: 100,
        errorMessage: null,
        summary: 'Comprehensive guide covering Scaled Dot-Product Attention, Multi-Head Attention, RoPE positional encodings, and Residual Connections.',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
      },
      {
        id: doc2Id,
        userId: userId,
        projectId: project1Id,
        title: 'KV Cache Memory & FlashAttention Engineering Notes.pdf',
        originalFileName: 'FlashAttention_and_KVCache.pdf',
        fileSize: 1890000,
        fileType: 'application/pdf',
        pageCount: 12,
        status: 'READY',
        progress: 100,
        errorMessage: null,
        summary: 'Engineering analysis of GPU memory hierarchy (HBM vs SRAM), IO-awareness in FlashAttention, and token generation memory footprints.',
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
      }
    ],

    document_chunks: [
      {
        id: 'chunk-1',
        materialId: doc1Id,
        projectId: project1Id,
        pageNumber: 3,
        sectionTitle: 'Scaled Dot-Product Attention Mechanics',
        content: 'Scaled Dot-Product Attention computes the compatibility of Query (Q) and Key (K) vectors, then scales by sqrt(d_k) to prevent vanishing gradients in softmax for large dimensions. The formula is Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. Scaling by sqrt(d_k) ensures that the variance of the dot products remains 1 when elements of Q and K have mean 0 and variance 1.',
        concepts: ['Scaled Dot-Product Attention', 'Softmax Scaling'],
        tokenCount: 88
      },
      {
        id: 'chunk-2',
        materialId: doc1Id,
        projectId: project1Id,
        pageNumber: 7,
        sectionTitle: 'Multi-Head Attention Projections',
        content: 'Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions. Instead of performing a single attention function with d_model-dimensional queries, keys, and values, we linearly project queries, keys, and values h times with learned linear projections to d_k, d_k, and d_v dimensions respectively.',
        concepts: ['Multi-Head Attention', 'Linear Projections'],
        tokenCount: 82
      },
      {
        id: 'chunk-3',
        materialId: doc1Id,
        projectId: project1Id,
        pageNumber: 14,
        sectionTitle: 'Rotary Position Embeddings (RoPE)',
        content: 'Rotary Position Embedding (RoPE) encodes position information by rotating query and key representations in complex vector space. RoPE provides relative position awareness without requiring learnable absolute positional embedding tables, exhibiting strong length generalization for context windows.',
        concepts: ['Positional Encoding (RoPE)', 'Relative Positional Awareness'],
        tokenCount: 75
      },
      {
        id: 'chunk-4',
        materialId: doc2Id,
        projectId: project1Id,
        pageNumber: 4,
        sectionTitle: 'KV Cache Mechanics in Autoregressive Decoding',
        content: 'During inference in decoder-only LLMs, generation proceeds token by token. Without caching, previous Key and Value tensors would need to be recomputed at every forward pass, creating O(N^2) redundant computation. The KV Cache stores Key and Value states across past tokens in GPU High Bandwidth Memory (HBM), reducing generation step time to O(N).',
        concepts: ['KV Cache Optimization', 'Autoregressive Decoding'],
        tokenCount: 86
      },
      {
        id: 'chunk-5',
        materialId: doc2Id,
        projectId: project1Id,
        pageNumber: 9,
        sectionTitle: 'FlashAttention & GPU Memory Hierarchy',
        content: 'Standard attention stores intermediate N x N attention matrices in High Bandwidth Memory (HBM), causing memory bandwidth bottlenecks. FlashAttention tiles the Q, K, V matrices and performs softmax reduction incrementally in fast on-chip SRAM, avoiding high-latency reads and writes to global GPU HBM.',
        concepts: ['FlashAttention', 'GPU Memory Hierarchy', 'Tiling & SRAM'],
        tokenCount: 84
      }
    ],

    concepts: [
      {
        id: 'concept-1',
        projectId: project1Id,
        name: 'Scaled Dot-Product Attention',
        description: 'The core attention equation Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V and gradient scaling rationale.',
        importance: 'high',
        category: 'Core Architecture'
      },
      {
        id: 'concept-2',
        projectId: project1Id,
        name: 'Multi-Head Attention',
        description: 'Parallel attention projections across representation subspaces with output projection W_O.',
        importance: 'high',
        category: 'Core Architecture'
      },
      {
        id: 'concept-3',
        projectId: project1Id,
        name: 'Positional Encoding (RoPE)',
        description: 'Rotary position embeddings rotating vectors in 2D complex planes for relative position awareness.',
        importance: 'critical',
        category: 'Positional Encoding'
      },
      {
        id: 'concept-4',
        projectId: project1Id,
        name: 'KV Cache Optimization',
        description: 'Storing past Key and Value projection states in GPU HBM to avoid redundant recomputations during generation.',
        importance: 'high',
        category: 'Inference & Efficiency'
      },
      {
        id: 'concept-5',
        projectId: project1Id,
        name: 'FlashAttention & SRAM Tiling',
        description: 'IO-aware exact attention tiling computations within fast SRAM to bypass memory bandwidth bottlenecks.',
        importance: 'medium',
        category: 'Inference & Efficiency'
      }
    ],

    concept_mastery: [
      {
        id: 'mast-1',
        userId: userId,
        projectId: project1Id,
        conceptId: 'concept-1',
        conceptName: 'Scaled Dot-Product Attention',
        score: 88,
        status: 'Improving', // Improving, Stable, Requiring Attention
        evidenceCount: 14,
        lastAssessedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'mast-2',
        userId: userId,
        projectId: project1Id,
        conceptId: 'concept-2',
        conceptName: 'Multi-Head Attention',
        score: 72,
        status: 'Stable',
        evidenceCount: 9,
        lastAssessedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'mast-3',
        userId: userId,
        projectId: project1Id,
        conceptId: 'concept-3',
        conceptName: 'Positional Encoding (RoPE)',
        score: 42,
        status: 'Requiring Attention',
        evidenceCount: 6,
        lastAssessedAt: new Date(Date.now() - 12 * 3600000).toISOString()
      },
      {
        id: 'mast-4',
        userId: userId,
        projectId: project1Id,
        conceptId: 'concept-4',
        conceptName: 'KV Cache Optimization',
        score: 65,
        status: 'Stable',
        evidenceCount: 8,
        lastAssessedAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'mast-5',
        userId: userId,
        projectId: project1Id,
        conceptId: 'concept-5',
        conceptName: 'FlashAttention & SRAM Tiling',
        score: 51,
        status: 'Requiring Attention',
        evidenceCount: 5,
        lastAssessedAt: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ],

    mastery_history: [
      { id: 'mh-1', userId: userId, projectId: project1Id, conceptId: 'concept-1', score: 62, timestamp: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: 'mh-2', userId: userId, projectId: project1Id, conceptId: 'concept-1', score: 75, timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: 'mh-3', userId: userId, projectId: project1Id, conceptId: 'concept-1', score: 88, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: 'mh-4', userId: userId, projectId: project1Id, conceptId: 'concept-3', score: 50, timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 'mh-5', userId: userId, projectId: project1Id, conceptId: 'concept-3', score: 42, timestamp: new Date(Date.now() - 12 * 3600000).toISOString() }
    ],

    conversations: [
      {
        id: 'conv-1',
        userId: userId,
        projectId: project1Id,
        title: 'Understanding Softmax Scaling Factor',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],

    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        sender: 'user',
        content: 'Why is the dot product of Query and Key scaled by sqrt(d_k) in the attention formula?',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        sender: 'assistant',
        content: 'In Scaled Dot-Product Attention, the dot product between Query (Q) and Key (K) is scaled by `1 / sqrt(d_k)` primarily to prevent the softmax function from suffering from vanishing gradients when the vector dimension `d_k` is large.\n\n### Mathematical Reason:\nIf components of Query and Key are independent random variables with zero mean and unit variance, their dot product has a mean of `0` and a variance of `d_k`. For large values of `d_k`, the magnitudes of the dot products grow very large in scale, pushing the softmax function into regions where its gradients are extremely small.\n\nDividing by `sqrt(d_k)` brings the variance back to `1`, preserving stable gradient propagation during backpropagation.',
        citations: [
          {
            materialId: doc1Id,
            materialTitle: 'Transformer Architecture & Self-Attention Deep Dive.pdf',
            pageNumber: 3,
            sectionTitle: 'Scaled Dot-Product Attention Mechanics',
            snippet: 'Scaled Dot-Product Attention computes the compatibility of Query (Q) and Key (K) vectors, then scales by sqrt(d_k) to prevent vanishing gradients in softmax for large dimensions.'
          }
        ],
        isGrounded: true,
        insufficientEvidence: false,
        latencyMs: 420,
        tokenUsage: { prompt: 310, completion: 185, total: 495 },
        createdAt: new Date(Date.now() - 2 * 86400000 + 1000).toISOString()
      }
    ],

    quizzes: [
      {
        id: 'quiz-1',
        projectId: project1Id,
        userId: userId,
        title: 'Adaptive Assessment: Attention Mechanics & Encodings',
        status: 'completed',
        score: 78,
        totalQuestions: 3,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],

    quiz_questions: [
      {
        id: 'q-1',
        quizId: 'quiz-1',
        projectId: project1Id,
        conceptId: 'concept-1',
        conceptName: 'Scaled Dot-Product Attention',
        type: 'multiple_choice',
        difficulty: 'medium',
        prompt: 'What happens to the variance of the dot product between two d_k-dimensional vectors with zero mean and unit variance?',
        options: [
          'The variance remains 1 regardless of d_k',
          'The variance grows proportionally to d_k',
          'The variance shrinks to 1 / d_k',
          'The variance approaches zero'
        ],
        correctAnswer: 1,
        explanation: 'The sum of d_k independent unit variance products has a total variance of d_k. Dividing by sqrt(d_k) rescales the variance back to 1.',
        userAnswer: 1,
        isCorrect: true
      },
      {
        id: 'q-2',
        quizId: 'quiz-1',
        projectId: project1Id,
        conceptId: 'concept-3',
        conceptName: 'Positional Encoding (RoPE)',
        type: 'open_ended',
        difficulty: 'hard',
        prompt: 'Explain how Rotary Position Embedding (RoPE) preserves relative distance between tokens without using a lookup table.',
        rubric: {
          understandingWeight: 30,
          accuracyWeight: 30,
          keyConceptsWeight: 20,
          reasoningWeight: 20
        },
        userAnswer: 'RoPE rotates the query and key vectors in 2D chunks using complex numbers based on token position m. When you take the inner product of Query at position m and Key at position n, the position angle becomes (m - n), so it naturally depends on relative distance.',
        aiEvaluation: {
          score: 85,
          understanding: 'Strong grasp of the complex 2D rotation mechanism and inner product angle subtraction property.',
          accuracy: 'Accurate description of the angle delta (m - n).',
          keyConceptsCovered: ['2D rotation in complex space', 'Inner product invariance to absolute shift', 'Relative position delta (m - n)'],
          missingConcepts: ['Did not mention length generalization or decayed attention with increased relative distance'],
          reasoningScore: 88
        }
      }
    ],

    flashcards: [
      {
        id: 'fc-1',
        projectId: project1Id,
        conceptId: 'concept-1',
        front: 'Why do we scale by sqrt(d_k) in Scaled Dot-Product Attention?',
        back: 'To prevent the softmax function from entering saturation regions with near-zero gradients when d_k is large (by scaling variance from d_k back to 1).',
        interval: 3,
        repetitions: 2,
        easeFactor: 2.5,
        dueDate: new Date(Date.now() + 86400000).toISOString()
      },
      {
        id: 'fc-2',
        projectId: project1Id,
        conceptId: 'concept-3',
        front: 'What mathematical operation enables RoPE to encode relative position?',
        back: 'Applying 2D rotation matrices to consecutive pairs of dimensions in Query and Key vectors; dot product results in trigonometric identity depending on (m - n).',
        interval: 1,
        repetitions: 1,
        easeFactor: 2.2,
        dueDate: new Date().toISOString()
      },
      {
        id: 'fc-3',
        projectId: project1Id,
        conceptId: 'concept-4',
        front: 'What is the main computational savings of using a KV Cache during inference?',
        back: 'Avoids recomputing Key and Value projection matrices for previously generated tokens in decoder-only models, reducing per-token complexity from O(N^2) to O(N).',
        interval: 4,
        repetitions: 3,
        easeFactor: 2.6,
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString()
      }
    ],

    roadmaps: [
      {
        id: 'rm-1',
        projectId: project1Id,
        title: 'Mastery Learning Plan: Transformer Inference & Architecture',
        milestones: [
          {
            id: 'm-1',
            title: 'Foundational Attention Math & Softmax Scaling',
            description: 'Understand Scaled Dot-Product Attention equations and variance preservation.',
            status: 'completed',
            targetConcept: 'Scaled Dot-Product Attention'
          },
          {
            id: 'm-2',
            title: 'Relative Positional Encodings & RoPE Matrix Rotations',
            description: 'Study Page 14 of the guide and resolve relative distance rotational geometry.',
            status: 'in_progress',
            targetConcept: 'Positional Encoding (RoPE)'
          },
          {
            id: 'm-3',
            title: 'GPU Memory Hierarchy & KV Cache Sizing',
            description: 'Calculate HBM footprint for multi-head vs grouped-query attention models.',
            status: 'pending',
            targetConcept: 'KV Cache Optimization'
          },
          {
            id: 'm-4',
            title: 'FlashAttention Tiling Algorithm Implementation',
            description: 'Analyze SRAM block sizes and online softmax updates.',
            status: 'pending',
            targetConcept: 'FlashAttention & SRAM Tiling'
          }
        ]
      }
    ],

    recommendations: [
      {
        id: 'rec-1',
        userId: userId,
        projectId: project1Id,
        type: 'practice_weakness',
        title: 'Review Rotary Positional Embeddings (RoPE)',
        description: 'Your mastery score on Positional Encoding is 42% (Requiring Attention). Practice relative distance rotation questions and review Page 14 of your guide.',
        actionType: 'start_quiz',
        actionPayload: { conceptId: 'concept-3', targetDifficulty: 'medium' },
        priority: 'high',
        isDismissed: false,
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      },
      {
        id: 'rec-2',
        userId: userId,
        projectId: project1Id,
        type: 'review_material',
        title: 'Deepen FlashAttention Memory Bottleneck Mechanics',
        description: 'Re-read Page 9 of "KV Cache Memory & FlashAttention Engineering Notes.pdf" regarding SRAM vs HBM memory bandwidth.',
        actionType: 'open_material',
        actionPayload: { materialId: doc2Id, pageNumber: 9 },
        priority: 'medium',
        isDismissed: false,
        createdAt: new Date(Date.now() - 10 * 3600000).toISOString()
      }
    ],

    events: [
      {
        id: 'evt-1',
        userId: userId,
        projectId: project1Id,
        type: 'DOCUMENT_PROCESSED',
        title: 'Document processed & indexed',
        details: 'Transformer Architecture & Self-Attention Deep Dive.pdf (18 pages, 8 chunks extracted)',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
      },
      {
        id: 'evt-2',
        userId: userId,
        projectId: project1Id,
        type: 'TUTOR_INTERACTION',
        title: 'AI Tutor Session completed',
        details: 'Asked about Softmax Scaling Factor (Grounded response with Page 3 citation)',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'evt-3',
        userId: userId,
        projectId: project1Id,
        type: 'QUIZ_COMPLETED',
        title: 'Adaptive Assessment completed',
        details: 'Scored 78% on Attention Mechanics assessment (Concept mastery updated)',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'evt-4',
        userId: userId,
        projectId: project1Id,
        type: 'MASTERY_UPDATED',
        title: 'Concept Mastery updated',
        details: 'Scaled Dot-Product Attention increased to 88% (Status: Improving)',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'evt-5',
        userId: userId,
        projectId: project1Id,
        type: 'RECOMMENDATION_GENERATED',
        title: 'New learning recommendation',
        details: 'Targeted practice recommended for Positional Encoding (RoPE)',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      }
    ],

    ai_logs: [
      {
        id: 'log-1',
        userId: userId,
        projectId: project1Id,
        feature: 'tutor_chat',
        model: 'gemini-1.5-flash',
        promptTokens: 310,
        completionTokens: 185,
        totalTokens: 495,
        estimatedCost: 0.000078,
        latencyMs: 420,
        status: 'SUCCESS',
        isGrounded: true,
        insufficientEvidence: false,
        promptPreview: 'Why is the dot product of Query and Key scaled by sqrt(d_k)...',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'log-2',
        userId: userId,
        projectId: project1Id,
        feature: 'assessment_grading',
        model: 'gemini-1.5-flash',
        promptTokens: 420,
        completionTokens: 140,
        totalTokens: 560,
        estimatedCost: 0.000073,
        latencyMs: 510,
        status: 'SUCCESS',
        isGrounded: true,
        promptPreview: 'Grading open-ended answer for RoPE rotation...',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'log-3',
        userId: userId,
        projectId: project1Id,
        feature: 'adaptive_question_gen',
        model: 'gemini-1.5-flash',
        promptTokens: 540,
        completionTokens: 210,
        totalTokens: 750,
        estimatedCost: 0.000103,
        latencyMs: 590,
        status: 'SUCCESS',
        isGrounded: true,
        promptPreview: 'Generating adaptive question for weak concept Positional Encoding...',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'log-4',
        userId: userId,
        projectId: project1Id,
        feature: 'tutor_unsupported_refusal',
        model: 'gemini-1.5-flash',
        promptTokens: 290,
        completionTokens: 90,
        totalTokens: 380,
        estimatedCost: 0.000048,
        latencyMs: 310,
        status: 'SUCCESS',
        isGrounded: false,
        insufficientEvidence: true,
        promptPreview: 'User asked about Quantum Chromodynamics in Transformers project...',
        createdAt: new Date(Date.now() - 18 * 3600000).toISOString()
      }
    ],

    ai_evaluations: [
      {
        id: 'eval-1',
        benchmarkName: 'Groundedness & Citation Accuracy',
        targetFeature: 'tutor_chat',
        testCaseCount: 25,
        passedCount: 24,
        accuracyRate: 96.0,
        meanLatencyMs: 440,
        evaluatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        status: 'PASSED',
        details: 'Evaluated accuracy of page and section citations against retrieved project text chunks.'
      },
      {
        id: 'eval-2',
        benchmarkName: 'Unsupported Question Handling & Refusal',
        targetFeature: 'tutor_chat',
        testCaseCount: 20,
        passedCount: 20,
        accuracyRate: 100.0,
        meanLatencyMs: 320,
        evaluatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        status: 'PASSED',
        details: 'Tested out-of-domain and ungrounded queries; verified absence of hallucinated facts.'
      },
      {
        id: 'eval-3',
        benchmarkName: 'Adaptive Open-Ended Rubric Grading Quality',
        targetFeature: 'assessment_grading',
        testCaseCount: 30,
        passedCount: 29,
        accuracyRate: 96.6,
        meanLatencyMs: 515,
        evaluatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        status: 'PASSED',
        details: 'Compared AI grading feedback against expert rubric scores on accuracy and missing concepts.'
      }
    ],

    background_jobs: [
      {
        id: 'job-1',
        jobType: 'DOCUMENT_PROCESSING',
        entityId: doc1Id,
        status: 'READY',
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        logs: [
          'Uploaded document: Transformer_Architecture_Deep_Dive.pdf',
          'Queued in processing engine',
          'Extracted 18 pages of text and mathematical notation',
          'Identified 5 major architectural concepts',
          'Generated 8 vector & keyword search chunks with page mapping',
          'Indexing complete: Ready for Tutor & Quiz retrieval'
        ],
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 8 * 86400000 + 4000).toISOString()
      },
      {
        id: 'job-2',
        jobType: 'RECOMMENDATION_ENGINE',
        entityId: project1Id,
        status: 'READY',
        progress: 100,
        retryCount: 0,
        maxRetries: 3,
        logs: [
          'Scanned concept mastery distribution for project',
          'Identified weak concept: Positional Encoding (RoPE) at 42%',
          'Generated targeted practice recommendation'
        ],
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        completedAt: new Date(Date.now() - 4 * 3600000 + 1200).toISOString()
      }
    ]
  };
}

module.exports = { getSeedData };
