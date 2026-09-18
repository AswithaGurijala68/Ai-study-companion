const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data_store.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      spaces: [],
      projects: [],
      materials: [],
      document_chunks: [],
      concepts: [],
      concept_mastery: [],
      mastery_history: [],
      conversations: [],
      messages: [],
      quizzes: [],
      quiz_questions: [],
      quiz_attempts: [],
      flashcards: [],
      roadmaps: [],
      recommendations: [],
      events: [],
      ai_logs: [],
      ai_evaluations: [],
      background_jobs: []
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading data store, seeding fresh data:', err);
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  seed() {
    const { getSeedData } = require('./seedData');
    this.data = getSeedData();
    this.save();
  }

  reset() {
    this.seed();
  }

  // Generic Query Helpers
  find(collection, predicate = () => true) {
    if (!this.data[collection]) return [];
    return this.data[collection].filter(predicate);
  }

  findOne(collection, predicate) {
    if (!this.data[collection]) return null;
    return this.data[collection].find(predicate) || null;
  }

  findById(collection, id) {
    return this.findOne(collection, item => item.id === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    const record = {
      id: item.id || uuidv4(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    this.data[collection].push(record);
    this.save();
    return record;
  }

  insertMany(collection, items) {
    if (!this.data[collection]) this.data[collection] = [];
    const records = items.map(item => ({
      id: item.id || uuidv4(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    }));
    this.data[collection].push(...records);
    this.save();
    return records;
  }

  update(collection, id, updates) {
    const index = (this.data[collection] || []).findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const index = (this.data[collection] || []).findIndex(item => item.id === id);
    if (index === -1) return false;
    this.data[collection].splice(index, 1);
    this.save();
    return true;
  }

  deleteMany(collection, predicate) {
    if (!this.data[collection]) return 0;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => !predicate(item));
    this.save();
    return initialLen - this.data[collection].length;
  }
}

const db = new Database();
module.exports = db;
