const db = require('../db/database');
const backgroundQueue = require('../services/backgroundQueue');
const { JOB_STATUS } = require('../config/constants');

exports.listMaterials = (req, res) => {
  const { projectId } = req.params;
  const materials = db.find('materials', m => m.projectId === projectId);
  res.json({ materials });
};

exports.uploadMaterial = (req, res) => {
  const { projectId } = req.params;
  const { title, textContent, summary } = req.body;
  const file = req.file;

  const project = db.findById('projects', projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const materialTitle = title || (file ? file.originalname : 'Document Notes.txt');
  const fileSize = file ? file.size : (textContent ? textContent.length : 1200);
  const fileType = file ? file.mimetype : 'text/plain';
  const filePath = file ? file.path : null;

  const newMaterial = db.insert('materials', {
    userId: req.user.id,
    projectId,
    title: materialTitle,
    originalFileName: file ? file.originalname : materialTitle,
    fileSize,
    fileType,
    filePath,
    pageCount: 1,
    status: JOB_STATUS.QUEUED,
    progress: 5,
    errorMessage: null,
    summary: summary || textContent || 'Uploaded learning document notes.'
  });

  // Add background processing job
  const job = backgroundQueue.addJob({
    jobType: 'DOCUMENT_PROCESSING',
    entityId: newMaterial.id,
    userId: req.user.id,
    projectId,
    payload: { filePath, rawText: textContent }
  });

  res.status(201).json({
    material: newMaterial,
    jobId: job.id
  });
};

exports.getMaterialStatus = (req, res) => {
  const { id } = req.params;
  const material = db.findById('materials', id);
  if (!material) return res.status(404).json({ error: 'Material not found' });

  const job = db.findOne('background_jobs', j => j.entityId === id);
  const chunks = db.find('document_chunks', c => c.materialId === id);

  res.json({
    material,
    job,
    chunkCount: chunks.length,
    chunks: chunks.slice(0, 10)
  });
};

exports.getMaterialChunks = (req, res) => {
  const { id } = req.params;
  const chunks = db.find('document_chunks', c => c.materialId === id);
  res.json({ chunks });
};

exports.retryProcessing = (req, res) => {
  const { id } = req.params;
  const material = db.findById('materials', id);
  if (!material) return res.status(404).json({ error: 'Material not found' });

  const job = db.findOne('background_jobs', j => j.entityId === id);
  if (job) {
    backgroundQueue.retryJob(job.id);
  } else {
    backgroundQueue.addJob({
      jobType: 'DOCUMENT_PROCESSING',
      entityId: material.id,
      userId: material.userId,
      projectId: material.projectId
    });
  }

  db.update('materials', id, { status: JOB_STATUS.QUEUED, progress: 0, errorMessage: null });
  res.json({ success: true, message: 'Processing retried' });
};

exports.deleteMaterial = (req, res) => {
  const { id } = req.params;
  const material = db.findById('materials', id);
  if (!material) return res.status(404).json({ error: 'Material not found' });

  db.delete('materials', id);
  db.deleteMany('document_chunks', c => c.materialId === id);
  res.json({ success: true, message: 'Material deleted' });
};
