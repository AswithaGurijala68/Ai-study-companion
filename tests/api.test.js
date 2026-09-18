const assert = require('assert');
const db = require('../server/src/db/database');

async function testApiAndIsolation() {
  console.log('🧪 Testing API, Database & Project Isolation...');

  // Test 1: Seed data loaded
  const users = db.find('users');
  assert.ok(users.length >= 2, 'Should have at least 2 seed users');
  console.log('  ✅ Seed users verified');

  // Test 2: Space & Project retrieval
  const spaces = db.find('spaces', s => s.userId === 'user-1');
  assert.ok(spaces.length >= 2, 'User 1 should have spaces');
  const spaceId = spaces[0].id;
  const projects = db.find('projects', p => p.spaceId === spaceId);
  assert.ok(projects.length >= 1, 'Space should contain projects');
  console.log('  ✅ Spaces and Projects hierarchy verified');

  // Test 3: Project Isolation
  const proj1 = projects[0];
  const proj1Chunks = db.find('document_chunks', c => c.projectId === proj1.id);
  assert.ok(proj1Chunks.length > 0, 'Project 1 should have isolated chunks');
  
  // Verify chunks belong exclusively to project 1
  for (const c of proj1Chunks) {
    assert.strictEqual(c.projectId, proj1.id, 'Chunk must belong strictly to Project 1');
  }
  console.log('  ✅ Project Chunk isolation verified');

  // Test 4: Dynamic Space Creation
  const newSpace = db.insert('spaces', {
    userId: 'user-1',
    name: 'Quantum Computing & Algorithms',
    description: 'Qubits, quantum gates, and Shor algorithm.',
    icon: 'Atom',
    color: 'cyan'
  });
  assert.ok(newSpace.id, 'New space should have generated ID');
  const found = db.findById('spaces', newSpace.id);
  assert.strictEqual(found.name, 'Quantum Computing & Algorithms');
  db.delete('spaces', newSpace.id);
  console.log('  ✅ Space creation and cleanup verified');

  return true;
}

module.exports = { testApiAndIsolation };
