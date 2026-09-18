const assert = require('assert');
const tutorService = require('../server/src/services/tutorService');
const retrievalEngine = require('../server/src/services/retrievalEngine');

async function testTutorGroundingAndRefusal() {
  console.log('🧪 Testing Grounded AI Tutor, Citations & Unsupported Question Handling...');

  // Test 1: Grounded Retrieval
  const retrieval = retrievalEngine.search({
    projectId: 'proj-transformers',
    query: 'Why scale by sqrt(d_k) in scaled dot-product attention?',
    limit: 2
  });

  assert.ok(retrieval.chunks.length > 0, 'Should find relevant chunks');
  assert.strictEqual(retrieval.insufficientEvidence, false, 'Should have sufficient evidence');
  const topChunk = retrieval.chunks[0];
  assert.ok(topChunk.pageNumber > 0, 'Chunk must contain valid page number for citation');
  console.log('  ✅ Grounded Retrieval & Page mapping verified');

  // Test 2: Tutor Grounded Response & Citation Badge
  const tutorResponse = await tutorService.respondToUser({
    conversationId: 'conv-test-1',
    projectId: 'proj-transformers',
    userId: 'user-1',
    message: 'Why is the dot product scaled by sqrt(d_k)?'
  });

  assert.ok(tutorResponse.content.length > 20, 'Tutor should return detailed response');
  assert.strictEqual(tutorResponse.isGrounded, true, 'Response must be marked grounded');
  assert.ok(tutorResponse.citations.length > 0, 'Response must include citation objects');
  assert.ok(tutorResponse.citations[0].pageNumber, 'Citation must contain source page');
  console.log('  ✅ Tutor Grounded Answer & Citation Object verified');

  // Test 3: Unsupported Question Refusal Handling
  const refusalResponse = await tutorService.respondToUser({
    conversationId: 'conv-test-1',
    projectId: 'proj-transformers',
    userId: 'user-1',
    message: 'What is the optimal thermodynamic compression ratio in a 4-stroke internal combustion engine?'
  });

  assert.strictEqual(refusalResponse.isGrounded, false, 'Out-of-scope query must not be marked grounded');
  assert.strictEqual(refusalResponse.insufficientEvidence, true, 'Must flag insufficient evidence');
  assert.ok(refusalResponse.content.includes('insufficient evidence') || refusalResponse.content.includes('project materials'), 'Refusal must communicate evidence lack');
  console.log('  ✅ Unsupported Question Refusal & Non-hallucination verified');

  return true;
}

module.exports = { testTutorGroundingAndRefusal };
