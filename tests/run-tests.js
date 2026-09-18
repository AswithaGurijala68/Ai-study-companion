const { testApiAndIsolation } = require('./api.test');
const { testTutorGroundingAndRefusal } = require('./tutor-grounding.test');
const { testAdaptiveQuizAndMastery } = require('./adaptive-quiz.test');
const { runEndToEndLearningLoopTest } = require('./e2e-learning-loop.test');

async function runAllTests() {
  console.log('====================================================');
  console.log('🏁 Starting AI Study Companion Automated Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  const suites = [
    { name: 'API & Isolation Security Suite', fn: testApiAndIsolation },
    { name: 'Tutor Grounding, Citations & Refusal Suite', fn: testTutorGroundingAndRefusal },
    { name: 'Adaptive Quiz, Rubric Grading & Mastery Suite', fn: testAdaptiveQuizAndMastery },
    { name: 'Full E2E Learning Loop & Real PDF Suite', fn: runEndToEndLearningLoopTest }
  ];

  for (const suite of suites) {
    try {
      console.log(`\n▶️ Running: ${suite.name}`);
      await suite.fn();
      passed++;
      console.log(`✔️ PASSED: ${suite.name}`);
      console.log('----------------------------------------------------');
    } catch (err) {
      console.error(`❌ FAILED: ${suite.name}`, err);
      console.log('----------------------------------------------------');
    }
  }

  const total = suites.length;
  console.log('====================================================');
  console.log(`📊 Test Results: ${passed}/${total} Suites Passed (${Math.round((passed/total)*100)}%)`);
  console.log('====================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests();
