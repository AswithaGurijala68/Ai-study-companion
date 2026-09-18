const crypto = require('crypto');
const db = require('../db/database');
const { createAuthToken } = require('../middleware/authMiddleware');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, encoded) {
  if (!encoded || !encoded.startsWith('scrypt$')) return false;
  const [, salt, stored] = encoded.split('$');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived), Buffer.from(stored));
}
function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

exports.login = (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const user = db.findOne('users', u => String(u.email).toLowerCase() === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  res.json({ token: createAuthToken(user.id), user: publicUser(user) });
};

exports.getCurrentUser = (req, res) => res.json({ user: publicUser(req.user) });

exports.register = (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (name.length < 2 || !email.includes('@') || password.length < 6) {
    return res.status(400).json({ error: 'Name, valid email, and a password of at least 6 characters are required.' });
  }
  if (db.findOne('users', u => String(u.email).toLowerCase() === email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  const user = db.insert('users', { name, email, role: 'student', passwordHash: hashPassword(password) });
  res.status(201).json({ token: createAuthToken(user.id), user: publicUser(user) });
};
