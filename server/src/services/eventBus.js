const db = require('../db/database');

class EventBus {
  constructor() {
    this.listeners = [];
  }

  on(eventType, callback) {
    this.listeners.push({ eventType, callback });
  }

  emitEvent({ userId, projectId, type, title, details = '' }) {
    const event = db.insert('events', {
      userId,
      projectId,
      type,
      title,
      details,
      createdAt: new Date().toISOString()
    });

    // Notify registered listeners
    for (const listener of this.listeners) {
      if (listener.eventType === '*' || listener.eventType === type) {
        try {
          listener.callback(event);
        } catch (err) {
          console.error(`Error in event listener for ${type}:`, err);
        }
      }
    }

    return event;
  }
}

const eventBus = new EventBus();
module.exports = eventBus;
