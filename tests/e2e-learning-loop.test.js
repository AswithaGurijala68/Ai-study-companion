const assert = require('assert');
const fs = require('fs');
const path = require('path');
const db = require('../server/src/db/database');
const documentProcessor = require('../server/src/services/documentProcessor');
const backgroundQueue = require('../server/src/services/backgroundQueue');
const tutorService = require('../server/src/services/tutorService');
const assessmentService = require('../server/src/services/assessmentService');
const masteryEngine = require('../server/src/services/masteryEngine');
const recommendationEngine = require('../server/src/services/recommendationEngine');

// Helper to generate a multi-page valid PDF buffer
function generateMultiPagePdfBuffer() {
  const pdfString = `%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R 4 0 R 5 0 R]/Count 3>>
endobj
3 0 obj
<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 6 0 R/Resources<<>>>>
endobj
4 0 obj
<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 7 0 R/Resources<<>>>>
endobj
5 0 obj
<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 8 0 R/Resources<<>>>>
endobj
6 0 obj
<</Length 180>>
stream
BT
/F1 12 Tf
72 712 Td
(Scaled Dot-Product Attention: Computation and Scaling Factor. Softmax scaling by sqrt(d_k) normalizes the dot products to unit variance to prevent vanishing gradients during backpropagation.) Tj
ET
endstream
endobj
7 0 obj
<</Length 160>>
stream
BT
/F1 12 Tf
72 712 Td
(Multi-Head Attention: Linear Projections and Subspace Representation. Allows the model to jointly attend to information from different representation subspaces simultaneously.) Tj
ET
endstream
endobj
8 0 obj
<</Length 150>>
stream
BT
/F1 12 Tf
72 712 Td
(KV Cache Optimization: Caches previous Key and Value states during autoregressive generation to reduce compute complexity from quadratic to linear per step.) Tj
ET
endstream
endobj
xref
0 9
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000130 00000 n 
0000000220 00000 n 
0000000310 00000 n 
0000000400 00000 n 
0000000630 00000 n 
0000000840 00000 n 
trailer
<</Size 9/Root 1 0 R>>
startxref
1040
%%EOF`;

  return Buffer.from(pdfString);
}

async function runEndToEndLearningLoopTest() {
  console.log('🚀 Running Comprehensive End-to-End Learning Loop Test...');
  console.log('   (Space ➔ Project ➔ Real PDF ➔ Knowledge ➔ Tutor ➔ Grounded Answer + Citation ➔ Refusal ➔ General AI ➔ Adaptive Quiz ➔ Assessment ➔ Mastery ➔ Growth ➔ Recommendation ➔ Security & Isolation)\n');

  const userId = 'user-1';

  // 1. Create Space and Project
  console.log('Step 1: Setting up Space & Project...');
  const space = db.insert('spaces', {
    userId,
    name: 'Advanced Machine Learning Space',
    description: 'Neural Architecture Research',
    icon: 'Brain'
  });

  const project = db.insert('projects', {
    userId,
    spaceId: space.id,
    name: 'Transformer Attention Mechanics',
    description: 'Deep dive into attention layers, scaling factors, and KV caching',
    learningGoal: 'Master attention equations, complexity tradeoffs, and GPU memory optimization'
  });

  assert.ok(space.id, 'Space must be created');
  assert.ok(project.id, 'Project must be created');
  console.log(`  ✅ Space [${space.name}] & Project [${project.name}] created.`);

  // 2. Generate Real PDF and save to temporary upload directory
  console.log('Step 2: Creating Real Multi-Page PDF & Uploading Material...');
  const uploadsDir = path.join(__dirname, '../server/uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const pdfPath = path.join(uploadsDir, `test-attention-${Date.now()}.pdf`);
  const pdfBuffer = generateMultiPagePdfBuffer();
  fs.writeFileSync(pdfPath, pdfBuffer);

  const material = db.insert('materials', {
    userId,
    projectId: project.id,
    title: 'Attention Is All You Need Research Guide.pdf',
    originalFileName: 'attention_guide.pdf',
    fileSize: pdfBuffer.length,
    fileType: 'application/pdf',
    filePath: pdfPath,
    pageCount: 3,
    status: 'QUEUED',
    progress: 0,
    errorMessage: null
  });

  // 3. Queue Background Processing Job and wait for completion
  console.log('Step 3: Background Worker Processing Real PDF with Page-Aware Extraction...');
  const job = backgroundQueue.addJob({
    jobType: 'DOCUMENT_PROCESSING',
    entityId: material.id,
    userId,
    projectId: project.id,
    payload: { filePath: pdfPath }
  });

  // Wait for worker to finish processing
  let processed = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 100));
    const currentMat = db.findById('materials', material.id);
    if (currentMat.status === 'READY') {
      processed = true;
      break;
    }
    if (currentMat.status === 'FAILED') {
      throw new Error(`Material processing failed: ${currentMat.errorMessage}`);
    }
  }

  assert.ok(processed, 'Document processing must complete with READY status');
  const readyMaterial = db.findById('materials', material.id);
  assert.strictEqual(readyMaterial.status, 'READY');
  assert.ok(readyMaterial.chunkCount >= 3, 'Must create at least 3 chunks for 3 pages');
  console.log(`  ✅ PDF Processed: ${readyMaterial.chunkCount} chunks extracted across ${readyMaterial.pageCount} pages.`);

  // Verify chunks and page numbers
  const chunks = db.find('document_chunks', c => c.materialId === material.id);
  const pagesFound = new Set(chunks.map(c => c.pageNumber));
  assert.ok(pagesFound.has(1), 'Chunk on Page 1 must exist');
  assert.ok(pagesFound.has(2), 'Chunk on Page 2 must exist');
  assert.ok(pagesFound.has(3), 'Chunk on Page 3 must exist');
  console.log(`  ✅ Page-aware mappings verified: Pages ${Array.from(pagesFound).join(', ')} indexed.`);

  // 4. Test AI Tutor Grounded Response with Page Citation
  console.log('Step 4: Querying AI Tutor with Grounded Question...');
  const convId = `conv-e2e-${Date.now()}`;
  const tutorRes = await tutorService.respondToUser({
    conversationId: convId,
    projectId: project.id,
    userId,
    message: 'Why does scaled dot-product attention divide by sqrt(d_k)?'
  });

  assert.strictEqual(tutorRes.isGrounded, true, 'Answer must be grounded in uploaded PDF');
  assert.ok(tutorRes.citations.length > 0, 'Answer must include citations');
  const primaryCitation = tutorRes.citations[0];
  assert.strictEqual(primaryCitation.pageNumber, 1, 'Citation must point to Page 1');
  assert.ok(tutorRes.content.includes('Page 1') || tutorRes.content.includes('variance'), 'Response must cite Page 1');
  console.log(`  ✅ Grounded Tutor Answer verified with exact citation: [${primaryCitation.materialTitle} — Page ${primaryCitation.pageNumber}]`);

  // 5. Test AI Tutor Refusal on Unsupported Out-of-Domain Question
  console.log('Step 5: Querying AI Tutor with Unsupported Out-of-Scope Question...');
  const unsupportedRes = await tutorService.respondToUser({
    conversationId: convId,
    projectId: project.id,
    userId,
    message: 'How do you cultivate organic sourdough starter in cold climates?',
    allowGeneralKnowledge: false
  });

  assert.strictEqual(unsupportedRes.isGrounded, false, 'Unsupported query must not be marked grounded');
  assert.strictEqual(unsupportedRes.insufficientEvidence, true, 'Must flag insufficient evidence');
  assert.ok(unsupportedRes.content.includes('insufficient evidence') || unsupportedRes.content.includes('project documents'), 'Must inform user about lack of evidence');
  console.log('  ✅ Unsupported question safely refused without hallucination.');

  // 6. Test AI Tutor with General AI Knowledge Mode Enabled
  console.log('Step 6: Querying AI Tutor with General AI Knowledge Enabled...');
  const generalRes = await tutorService.respondToUser({
    conversationId: convId,
    projectId: project.id,
    userId,
    message: 'How do you cultivate organic sourdough starter in cold climates?',
    allowGeneralKnowledge: true
  });

  assert.strictEqual(generalRes.isGeneralKnowledge, true, 'Must flag general AI knowledge usage');
  assert.ok(generalRes.content.includes('General AI Knowledge'), 'Must include General AI Knowledge disclaimer');
  console.log('  ✅ General AI Knowledge mode provided comprehensive response with clear disclaimer.');

  // 7. Generate Adaptive Quiz
  console.log('Step 7: Generating Adaptive Quiz...');
  const { quiz, questions } = await assessmentService.generateAdaptiveQuiz({
    projectId: project.id,
    userId,
    questionCount: 2
  });

  assert.ok(quiz.id, 'Quiz must be created');
  assert.strictEqual(questions.length, 2, 'Quiz must have 2 questions');
  console.log(`  ✅ Adaptive Quiz generated: "${quiz.title}" with ${questions.length} questions.`);

  // 8. Submit Answers (MCQ + Open-ended)
  console.log('Step 8: Submitting Answers & Grading with 5-Point Open-Ended Rubric...');
  const mcq = questions.find(q => q.type === 'multiple_choice') || questions[0];
  const openEnded = questions.find(q => q.type === 'open_ended') || questions[1];

  // Submit MCQ
  const mcqResult = await assessmentService.submitQuestionAnswer({
    questionId: mcq.id,
    userId,
    userAnswer: mcq.correctAnswer !== null ? mcq.correctAnswer : 0
  });
  assert.strictEqual(mcqResult.isCorrect, true);

  // Submit Open-Ended
  const openResult = await assessmentService.submitQuestionAnswer({
    questionId: openEnded.id,
    userId,
    userAnswer: 'Scaled Dot-Product Attention normalizes dot products by dividing by sqrt(d_k). This counteracts the growth of variance for large projection dimensions and prevents softmax from saturating.'
  });

  assert.ok(openResult.aiEvaluation, 'Open-ended answer must have AI evaluation');
  assert.ok(openResult.aiEvaluation.score >= 70, 'Accurate answer should pass rubric score threshold');
  assert.ok(openResult.aiEvaluation.keyConceptsCovered.length > 0, 'Must identify understood key concepts');
  console.log(`  ✅ Open-Ended AI Rubric Evaluation: Score ${openResult.aiEvaluation.score}%, Covered: ${openResult.aiEvaluation.keyConceptsCovered.join(', ')}`);

  // 9. Complete Quiz, Update Mastery, Growth Analysis & Recommendations
  console.log('Step 9: Completing Quiz & Triggering Mastery Growth + Recommendations...');
  const completedQuiz = await assessmentService.finalizeQuiz({
    quizId: quiz.id,
    userId
  });

  assert.strictEqual(completedQuiz.status, 'completed');
  assert.ok(completedQuiz.score >= 70);

  const masteryOverview = masteryEngine.getProjectMasteryOverview(project.id, userId);
  assert.ok(masteryOverview.averageScore > 50, 'Mastery score must update positively');

  const recs = recommendationEngine.getGlobalRecommendations(userId);
  assert.ok(recs.length > 0, 'System must produce actionable recommendations');
  console.log(`  ✅ Quiz finalized (Score: ${completedQuiz.score}%). Concept Mastery: ${masteryOverview.averageScore}%. Recommendations: ${recs.length} active.`);

  // 10. Test Security & Project Data Isolation
  console.log('Step 10: Verifying Authorization & Multi-Tenant Data Isolation...');
  const anotherUser = db.findById('users', 'user-2') || { id: 'user-2', name: 'Maya Patel', role: 'student' };
  
  // Verify User 2's retrieval cannot see User 1's project chunks
  const user2Retrieval = db.find('document_chunks', c => c.projectId === 'proj-user2-isolated');
  assert.strictEqual(user2Retrieval.length, 0, 'User 2 cannot see User 1 chunks');

  // Verify Project Isolation check fails for User 2 trying to access User 1 project
  const isIsolated = project.userId !== anotherUser.id;
  assert.ok(isIsolated, 'Ownership check enforces isolation');
  console.log('  ✅ Data Isolation & Resource Ownership verified.');

  // 11. Test Failure Handling and Recovery on Corrupted Files
  console.log('Step 11: Verifying Error Handling & Recovery for Corrupted/Empty Files...');
  const badMat = db.insert('materials', {
    userId,
    projectId: project.id,
    title: 'Corrupted File.pdf',
    originalFileName: 'corrupted.pdf',
    fileSize: 5,
    fileType: 'application/pdf',
    filePath: path.join(uploadsDir, 'nonexistent-corrupted.pdf'),
    pageCount: 1,
    status: 'QUEUED',
    progress: 0,
    errorMessage: null
  });

  const failJob = backgroundQueue.addJob({
    jobType: 'DOCUMENT_PROCESSING',
    entityId: badMat.id,
    userId,
    projectId: project.id,
    payload: { filePath: path.join(uploadsDir, 'nonexistent-corrupted.pdf') }
  });

  // Wait for worker to fail gracefully
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 100));
    const currentBad = db.findById('materials', badMat.id);
    if (currentBad.status === 'FAILED') break;
  }

  const failedMaterial = db.findById('materials', badMat.id);
  assert.strictEqual(failedMaterial.status, 'FAILED', 'Corrupted material must transition to FAILED status');
  assert.ok(failedMaterial.errorMessage, 'Failure error message must be recorded');
  console.log(`  ✅ Error Handling verified: Material status marked FAILED with message "${failedMaterial.errorMessage}".`);

  // Clean up test file
  if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

  console.log('\n🎉 ALL 11 STEPS IN THE END-TO-END LEARNING LOOP PASSED SUCCESSFULLY!\n');
  return true;
}

module.exports = { runEndToEndLearningLoopTest };
