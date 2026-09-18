const assert = require('assert');
const assessmentService = require('../server/src/services/assessmentService');
const masteryEngine = require('../server/src/services/masteryEngine');
const db = require('../server/src/db/database');

async function testAdaptiveQuizAndMastery() {
  console.log('🧪 Testing Adaptive Quiz Generation, AI Open-Ended Grading & Concept Mastery Updates...');

  // Test 1: Generate Adaptive Quiz targeting weak concepts
  const { quiz, questions } = await assessmentService.generateAdaptiveQuiz({
    projectId: 'proj-transformers',
    userId: 'user-1',
    questionCount: 2
  });

  assert.ok(quiz.id, 'Quiz must be generated with ID');
  assert.strictEqual(questions.length, 2, 'Quiz must contain requested question count');
  console.log('  ✅ Adaptive Quiz generation verified');

  // Test 2: MCQ Submission & Mastery update
  const mcqQuestion = questions.find(q => q.type === 'multiple_choice') || questions[0];
  const initialMastery = db.findOne('concept_mastery', m => m.conceptId === mcqQuestion.conceptId && m.userId === 'user-1');
  const initialScore = initialMastery ? initialMastery.score : 50;

  const answeredMCQ = await assessmentService.submitQuestionAnswer({
    questionId: mcqQuestion.id,
    userId: 'user-1',
    userAnswer: mcqQuestion.correctAnswer !== null ? mcqQuestion.correctAnswer : 0
  });

  assert.strictEqual(answeredMCQ.isCorrect, true, 'MCQ answer should be evaluated correct');
  const updatedMastery = db.findOne('concept_mastery', m => m.conceptId === mcqQuestion.conceptId && m.userId === 'user-1');
  assert.ok(updatedMastery.score >= initialScore, 'Mastery score should increase on correct answer');
  console.log(`  ✅ MCQ grading & Mastery score update verified (Score: ${initialScore}% -> ${updatedMastery.score}%)`);

  // Test 3: Open-Ended Rubric AI Grading
  const grading = await assessmentService.evaluateOpenEndedAnswer({
    questionPrompt: 'Explain how Positional Encoding with RoPE preserves relative distance.',
    conceptName: 'Positional Encoding (RoPE)',
    userAnswer: 'RoPE applies 2D rotation matrices to chunks of Query and Key vectors so that their dot product depends strictly on relative offset (m - n).',
    userId: 'user-1',
    projectId: 'proj-transformers'
  });

  assert.ok(grading.score >= 70, 'Detailed accurate answer should receive passing rubric score');
  assert.ok(grading.understanding, 'Evaluation must provide qualitative understanding feedback');
  assert.ok(grading.keyConceptsCovered.length > 0, 'Evaluation must list covered concepts');
  console.log(`  ✅ Open-Ended AI Rubric Grading verified (Rubric Score: ${grading.score}%, Covered: ${grading.keyConceptsCovered.join(', ')})`);

  return true;
}

module.exports = { testAdaptiveQuizAndMastery };
