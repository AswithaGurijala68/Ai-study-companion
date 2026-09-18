const crypto = require('crypto');
const db = require('../db/database');

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const SECRET = process.env.AUTH_SECRET || 'studyflow-prototype-change-this-secret';

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
}

function createAuthToken(userId) {
  const payload = `${userId}.${Math.floor(Date.now() / 1000)}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  let payload;
  try { payload = Buffer.from(encoded, 'base64url').toString('utf8'); } catch { return null; }
  const expected = sign(payload);
  const actualBuf = Buffer.from(signature); const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(actualBuf, expectedBuf)) return null;
  const [userId, issuedAt] = payload.split('.');
  if (!userId || !issuedAt || !Number.isFinite(Number(issuedAt))) return null;
  if (Math.floor(Date.now() / 1000) - Number(issuedAt) > TOKEN_TTL_SECONDS) return null;
  return userId;
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const userId = verifyAuthToken(token);
  if (!userId) return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  const user = db.findById('users', userId);
  if (!user) return res.status(401).json({ error: 'Invalid authentication token.' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
  next();
}

function enforceProjectIsolation(req, res, next) {
  const projectId = req.params.projectId || req.params.id || req.body.projectId || req.query.projectId;
  if (!projectId) return next();
  const project = db.findById('projects', projectId);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  if (req.user.role !== 'admin' && project.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied: You do not have permission to access this project.' });
  }
  req.project = project;
  next();
}


function enforceResourceIsolation(collection, relation = null) {
  return (req, res, next) => {
    const id = req.params.id || req.params.questionId;
    if (!id) return next();
    const item = db.findById(collection, id);
    if (!item) return res.status(404).json({ error: 'Resource not found.' });
    let ownerId = item.userId;
    if (relation) {
      const parent = db.findById(relation.collection, item[relation.field]);
      ownerId = parent?.userId;
    }
    if (req.user.role !== 'admin' && ownerId && ownerId !== req.user.id) return res.status(403).json({ error: 'Access denied.' });
    next();
  };
}

module.exports = { authMiddleware, requireAdmin, enforceProjectIsolation, enforceResourceIsolation, createAuthToken };
