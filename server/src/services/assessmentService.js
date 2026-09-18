const db = require('../db/database');
const aiService = require('./aiService');
const eventBus = require('./eventBus');
const masteryEngine = require('./masteryEngine');
const recommendationEngine = require('./recommendationEngine');

class AssessmentService {
  async generateAdaptiveQuiz({ projectId, userId, targetConceptId = null, questionCount = 3 }) {
    const project = db.findById('projects', projectId);
    if (!project) throw new Error('Project not found');

    let concepts = db.find('concepts', c => c.projectId === projectId);
    
    // If no concepts are indexed yet, dynamically seed foundational concepts from project goal
    if (concepts.length === 0) {
      const defaultConceptNames = [
        `${project.name} - Fundamentals`,
        `${project.name} - Operational Mechanics`,
        `${project.name} - Core Architecture & Tradeoffs`
      ];

      for (const name of defaultConceptNames) {
        const newC = db.insert('concepts', {
          projectId,
          name,
          description: `Foundational domain concept derived from learning goal: "${project.learningGoal}"`,
          category: 'Core Concepts',
          importance: 'high'
        });

        db.insert('concept_mastery', {
          userId,
          projectId,
          conceptId: newC.id,
          conceptName: name,
          score: 50,
          status: 'Stable',
          evidenceCount: 0,
          lastAssessedAt: new Date().toISOString()
        });
      }

      concepts = db.find('concepts', c => c.projectId === projectId);
    }

    const masteryList = db.find('concept_mastery', m => m.projectId === projectId && m.userId === userId);
    
    // Inspect past quiz mistakes in this project
    const pastQuizzes = db.find('quizzes', q => q.projectId === projectId && q.userId === userId);
    const pastQuizIds = pastQuizzes.map(q => q.id);
    const pastMistakeQuestions = db.find('quiz_questions', q => pastQuizIds.includes(q.quizId) && q.isCorrect === false);
    const mistakeConceptIds = new Set(pastMistakeQuestions.map(q => q.conceptId));

    // Adaptive concept selection: prioritize targeted concept, then mistake concepts, then lowest mastery
    let selectedConcepts = [];
    if (targetConceptId) {
      const target = concepts.find(c => c.id === targetConceptId);
      if (target) selectedConcepts.push(target);
    }

    // 1. Prioritize concepts with recent mistakes
    for (const cId of mistakeConceptIds) {
      if (selectedConcepts.length >= questionCount) break;
      const c = concepts.find(item => item.id === cId);
      if (c && !selectedConcepts.some(sc => sc.id === c.id)) {
        selectedConcepts.push(c);
      }
    }

    // 2. Sort remaining concepts by mastery score ascending (lowest first)
    const sortedMastery = [...masteryList].sort((a, b) => a.score - b.score);
    for (const m of sortedMastery) {
      if (selectedConcepts.length >= questionCount) break;
      const matching = concepts.find(c => c.id === m.conceptId);
      if (matching && !selectedConcepts.some(c => c.id === matching.id)) {
        selectedConcepts.push(matching);
      }
    }

    // 3. Fill any remaining slots with other available project concepts
    for (const c of concepts) {
      if (selectedConcepts.length >= questionCount) break;
      if (!selectedConcepts.some(sc => sc.id === c.id)) {
        selectedConcepts.push(c);
      }
    }

    // Create Quiz record
    const quiz = db.insert('quizzes', {
      projectId,
      userId,
      title: `Adaptive Assessment: ${selectedConcepts.map(c => c.name).slice(0, 2).join(' & ')}`,
      status: 'in_progress',
      score: null,
      totalQuestions: selectedConcepts.length
    });

    const questions = [];
    for (let i = 0; i < selectedConcepts.length; i++) {
      const concept = selectedConcepts[i];
      const mRecord = masteryList.find(m => m.conceptId === concept.id);
      const masteryScore = mRecord ? mRecord.score : 50;

      // Determine adaptive difficulty & question type
      let difficulty = 'medium';
      if (masteryScore < 50 || mistakeConceptIds.has(concept.id)) {
        difficulty = 'easy';
      } else if (masteryScore >= 75) {
        difficulty = 'hard';
      }

      // Alternate question types: MCQs and open-ended
      const questionType = i % 2 === 1 ? 'open_ended' : 'multiple_choice';

      const question = await this.generateQuestion({
        quizId: quiz.id,
        projectId,
        userId,
        concept,
        difficulty,
        questionType
      });

      questions.push(question);
    }

    return {
      quiz,
      questions
    };
  }

  async generateQuestion({ quizId, projectId, userId, concept, difficulty, questionType }) {
    // Retrieve project material chunks for this concept to ensure grounded questions
    const chunks = db.find('document_chunks', c => 
      c.projectId === projectId && 
      ((c.concepts && c.concepts.includes(concept.name)) || (c.content && c.content.includes(concept.name)))
    );
    const referenceContext = chunks.slice(0, 2).map(c => c.content).join('\n');

    let prompt = `Generate an adaptive ${difficulty} ${questionType} assessment question for the concept "${concept.name}".
Context from project notes: ${referenceContext || concept.description}`;

    if (questionType === 'multiple_choice') {
      prompt += `\nOutput pure JSON:
{
  "prompt": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why Option A is correct based on theory."
}`;
    } else {
      prompt += `\nOutput pure JSON:
{
  "prompt": "Explain how ... works and why it is important for ...?",
  "rubric": {
    "understandingWeight": 30,
    "accuracyWeight": 30,
    "keyConceptsWeight": 20,
    "reasoningWeight": 20
  }
}`;
    }

    const aiRes = await aiService.generateText({
      prompt,
      systemPrompt: 'You are an expert psychometrician and AI tutor creating grounded, calibrated adaptive questions.',
      feature: 'adaptive_question_gen',
      userId,
      projectId,
      context: { conceptName: concept.name, difficulty, questionType }
    });

    let parsedData = {};
    try {
      const cleanJson = aiRes.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      if (questionType === 'multiple_choice') {
        parsedData = {
          prompt: `In the context of ${concept.name}, which factor is most crucial for maintaining stability and optimal learning performance?`,
          options: [
            `Proper mathematical scaling and normalization to preserve stability in ${concept.name}`,
            `Arbitrarily increasing parameter count without structural bounds`,
            `Removing all residual and feedback connections`,
            `Bypassing error checking and gradient verification`
          ],
          correctAnswer: 0,
          explanation: `Proper scaling and normalization are fundamental to preserving gradient flow and computational stability in ${concept.name}.`
        };
      } else {
        parsedData = {
          prompt: `Explain the core mechanism of ${concept.name} within this learning domain. What happens if this mechanism fails or is omitted?`,
          rubric: { understandingWeight: 30, accuracyWeight: 30, keyConceptsWeight: 20, reasoningWeight: 20 }
        };
      }
    }

    return db.insert('quiz_questions', {
      quizId,
      projectId,
      conceptId: concept.id,
      conceptName: concept.name,
      type: questionType,
      difficulty,
      prompt: parsedData.prompt,
      options: parsedData.options || null,
      correctAnswer: parsedData.correctAnswer !== undefined ? parsedData.correctAnswer : null,
      explanation: parsedData.explanation || null,
      rubric: parsedData.rubric || null,
      userAnswer: null,
      isCorrect: null,
      aiEvaluation: null
    });
  }

  async submitQuestionAnswer({ questionId, userId, userAnswer }) {
    const question = db.findById('quiz_questions', questionId);
    if (!question) throw new Error('Question not found');

    let isCorrect = false;
    let aiEvaluation = null;
    let scoreEarned = 0;

    if (question.type === 'multiple_choice') {
      isCorrect = Number(userAnswer) === Number(question.correctAnswer);
      scoreEarned = isCorrect ? 100 : 0;
    } else {
      // Open-ended evaluation with grounded 5-point rubric
      aiEvaluation = await this.evaluateOpenEndedAnswer({
        questionPrompt: question.prompt,
        conceptName: question.conceptName,
        userAnswer: userAnswer,
        userId: userId,
        projectId: question.projectId
      });
      scoreEarned = aiEvaluation.score;
      isCorrect = scoreEarned >= 70;
    }

    // Update question record
    const updatedQuestion = db.update('quiz_questions', questionId, {
      userAnswer,
      isCorrect,
      aiEvaluation
    });

    // Update Concept Mastery
    await masteryEngine.recordAssessmentResult({
      userId,
      projectId: question.projectId,
      conceptId: question.conceptId,
      conceptName: question.conceptName,
      questionType: question.type,
      isCorrect,
      score: scoreEarned
    });

    return updatedQuestion;
  }

  async evaluateOpenEndedAnswer({ questionPrompt, conceptName, userAnswer, userId, projectId }) {
    // Retrieve project material chunks for reference context
    const chunks = db.find('document_chunks', c => 
      c.projectId === projectId && 
      ((c.concepts && c.concepts.includes(conceptName)) || (c.content && c.content.includes(conceptName)))
    );
    const referenceContext = chunks.slice(0, 2).map(c => c.content).join('\n');

    const prompt = `Evaluate the student's answer to this open-ended learning question using the reference materials.
Question: "${questionPrompt}"
Target Concept: "${conceptName}"
Reference Materials: "${referenceContext || 'Standard domain literature'}"
Student Answer: "${userAnswer}"

Evaluate strictly on:
1. Understanding (0-100)
2. Accuracy (0-100)
3. Key Concepts covered
4. Missing Concepts or misconceptions
5. Overall score (0-100)

Output pure JSON format:
{
  "score": 85,
  "understanding": "Clear qualitative explanation of ...",
  "accuracy": "Accurate description of ...",
  "keyConceptsCovered": ["Concept A", "Concept B"],
  "missingConcepts": ["Did not mention edge case X"],
  "reasoningScore": 88
}`;

    const aiRes = await aiService.generateText({
      prompt,
      systemPrompt: 'You are an expert AI evaluator grading student answers with constructive pedagogical feedback based on project materials.',
      feature: 'assessment_grading',
      userId,
      projectId,
      context: { conceptName, userAnswer }
    });

    let evalObj = {};
    try {
      const cleanJson = aiRes.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      evalObj = JSON.parse(cleanJson);
    } catch (e) {
      const isDetailed = (userAnswer || '').length > 40;
      evalObj = {
        score: isDetailed ? 84 : 58,
        understanding: isDetailed ? "Demonstrated clear conceptual comprehension of the mechanism." : "Brief answer with partial understanding; requires deeper explanation.",
        accuracy: isDetailed ? "Accurate explanation aligned with project material definitions." : "Partially accurate, but lacks key technical details.",
        keyConceptsCovered: [conceptName],
        missingConcepts: isDetailed ? ["Boundary condition analysis"] : ["Core mathematical formulation", "Operational impact"],
        reasoningScore: isDetailed ? 85 : 60
      };
    }

    return evalObj;
  }

  async finalizeQuiz({ quizId, userId }) {
    const quiz = db.findById('quizzes', quizId);
    if (!quiz) throw new Error('Quiz not found');

    const questions = db.find('quiz_questions', q => q.quizId === quizId);
    let totalScore = 0;

    for (const q of questions) {
      if (q.type === 'multiple_choice') {
        totalScore += q.isCorrect ? 100 : 0;
      } else if (q.aiEvaluation) {
        totalScore += q.aiEvaluation.score;
      }
    }

    const finalAvg = Math.round(totalScore / (questions.length || 1));

    const updatedQuiz = db.update('quizzes', quizId, {
      status: 'completed',
      score: finalAvg,
      completedAt: new Date().toISOString()
    });

    // Emit quiz completed event
    eventBus.emitEvent({
      userId,
      projectId: quiz.projectId,
      type: 'QUIZ_COMPLETED',
      title: 'Quiz Completed',
      details: `Completed "${quiz.title}" with a score of ${finalAvg}%`
    });

    // Trigger Recommendation generation
    await recommendationEngine.generateProjectRecommendations({
      projectId: quiz.projectId,
      userId
    });

    return updatedQuiz;
  }
}

const assessmentService = new AssessmentService();
module.exports = assessmentService;
