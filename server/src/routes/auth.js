const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/database');
const { generateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/auth/status
// Check if an admin exists to determine if setup is needed
router.get('/status', async (req, res, next) => {
  try {
    const db = await getDb();
    const admin = await db.get('SELECT id FROM admin LIMIT 1');
    res.json({ needsSetup: !admin });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/setup
// Register the primary admin (only works if no admin exists)
router.post('/setup', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = await getDb();
    const admin = await db.get('SELECT id FROM admin LIMIT 1');
    if (admin) {
      return res.status(403).json({ error: 'Admin account already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await db.run('INSERT INTO admin (username, password_hash) VALUES (?, ?)', [username, hash]);
    
    res.json({ success: true, message: 'Admin registered successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
// Authenticate admin and return JWT
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = await getDb();
    const admin = await db.get('SELECT * FROM admin WHERE username = ?', [username]);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(admin);
    res.json({ success: true, token, username: admin.username });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
