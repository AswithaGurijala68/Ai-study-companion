const db = require('../db/database');
const { JOB_STATUS, MAX_JOB_RETRIES } = require('../config/constants');
const eventBus = require('./eventBus');

class BackgroundQueue {
  constructor() {
    this.isProcessing = false;
    this.handlers = {};
  }

  registerHandler(jobType, handlerFn) {
    this.handlers[jobType] = handlerFn;
  }

  addJob({ jobType, entityId, userId, projectId, payload = {} }) {
    // Check for duplicate pending job to prevent redundant processing
    const existing = db.findOne('background_jobs', j => 
      j.entityId === entityId && 
      j.jobType === jobType && 
      (j.status === JOB_STATUS.QUEUED || j.status === JOB_STATUS.PROCESSING)
    );

    if (existing) {
      return existing;
    }

    const job = db.insert('background_jobs', {
      jobType,
      entityId,
      userId,
      projectId,
      payload,
      status: JOB_STATUS.QUEUED,
      progress: 0,
      retryCount: 0,
      maxRetries: MAX_JOB_RETRIES,
      errorMessage: null,
      logs: [`Job registered in queue: ${jobType} for entity ${entityId}`],
      createdAt: new Date().toISOString()
    });

    // Asynchronously trigger processing worker
    setTimeout(() => this.processNext(), 50);
    return job;
  }

  async processNext() {
    if (this.isProcessing) return;
    const nextJob = db.findOne('background_jobs', j => j.status === JOB_STATUS.QUEUED);
    if (!nextJob) return;

    this.isProcessing = true;
    try {
      await this.executeJob(nextJob.id);
    } catch (err) {
      console.error(`Error processing job ${nextJob.id}:`, err);
    } finally {
      this.isProcessing = false;
      // Check if more jobs pending
      setTimeout(() => this.processNext(), 100);
    }
  }

  async executeJob(jobId) {
    const job = db.findById('background_jobs', jobId);
    if (!job) return;

    const handler = this.handlers[job.jobType];
    if (!handler) {
      this.failJob(jobId, `No handler registered for job type ${job.jobType}`);
      return;
    }

    try {
      db.update('background_jobs', jobId, {
        status: JOB_STATUS.PROCESSING,
        progress: 10,
        logs: [...(job.logs || []), `Worker started processing ${job.jobType}`]
      });

      // Execute handler with progress callback
      await handler(job, (progress, logMessage) => {
        const current = db.findById('background_jobs', jobId);
        const updatedLogs = logMessage ? [...(current.logs || []), logMessage] : current.logs;
        db.update('background_jobs', jobId, {
          progress: Math.min(100, Math.max(0, progress)),
          logs: updatedLogs
        });
      });

      db.update('background_jobs', jobId, {
        status: JOB_STATUS.READY,
        progress: 100,
        completedAt: new Date().toISOString(),
        logs: [...(db.findById('background_jobs', jobId)?.logs || []), `Job completed successfully.`]
      });
    } catch (err) {
      console.error(`Job ${jobId} failed:`, err);
      if (job.retryCount < job.maxRetries) {
        db.update('background_jobs', jobId, {
          status: JOB_STATUS.QUEUED,
          retryCount: job.retryCount + 1,
          logs: [...(job.logs || []), `Job failed with error: ${err.message}. Retrying (${job.retryCount + 1}/${job.maxRetries})...`]
        });
      } else {
        this.failJob(jobId, err.message);
      }
    }
  }

  failJob(jobId, errorMessage) {
    const current = db.findById('background_jobs', jobId);
    db.update('background_jobs', jobId, {
      status: JOB_STATUS.FAILED,
      errorMessage: errorMessage,
      logs: [...(current?.logs || []), `Fatal Failure: ${errorMessage}`]
    });
  }

  retryJob(jobId) {
    const job = db.findById('background_jobs', jobId);
    if (!job) return null;

    db.update('background_jobs', jobId, {
      status: JOB_STATUS.QUEUED,
      progress: 0,
      errorMessage: null,
      logs: [...(job.logs || []), `Manual retry requested by user`]
    });

    setTimeout(() => this.processNext(), 50);
    return db.findById('background_jobs', jobId);
  }
}

const backgroundQueue = new BackgroundQueue();
module.exports = backgroundQueue;
