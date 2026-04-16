const express = require('express');
const { getDb } = require('../db/database');
const router = express.Router();

// GET /api/agents
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    const agents = await db.all('SELECT * FROM agents ORDER BY name ASC');
    res.json(agents);
  } catch (err) { next(err); }
});

// POST /api/agents
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const db = await getDb();
    const result = await db.run('INSERT INTO agents (name, description) VALUES (?, ?)', [name, description]);
    res.json({ id: result.lastID, name, description });
  } catch (err) { next(err); }
});

// PUT /api/agents/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const db = await getDb();
    await db.run('UPDATE agents SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, description, req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/agents/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM agents WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
