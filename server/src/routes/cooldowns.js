const express = require('express');
const { getDb } = require('../db/database');
const router = express.Router();

function addTime(dateStr, unit, value) {
  const d = new Date(dateStr);
  if (unit === 'hour') {
    d.setHours(d.getHours() + value);
  } else if (unit === 'day') {
    d.setDate(d.getDate() + value);
  }
  return d.toISOString();
}

function subtractTime(dateStr, unit, value) {
  const d = new Date(dateStr);
  if (unit === 'hour') {
    d.setHours(d.getHours() - value);
  } else if (unit === 'day') {
    d.setDate(d.getDate() - value);
  }
  return d.toISOString();
}

// Start cooldown for a profile's limit condition
router.post('/start', async (req, res, next) => {
  try {
    const { limit_id, started_at, ends_at, note } = req.body;
    let finalStart = started_at;
    let finalEnd = ends_at;

    const db = await getDb();
    const limitRow = await db.get('SELECT * FROM profile_limits WHERE id = ?', [limit_id]);
    
    if (!limitRow) return res.status(404).json({ error: 'Limit condition not found' });

    if (finalStart && !finalEnd) {
      finalEnd = addTime(finalStart, limitRow.limit_unit, limitRow.limit_value);
    } else if (finalEnd && !finalStart) {
      finalStart = subtractTime(finalEnd, limitRow.limit_unit, limitRow.limit_value);
    } else if (!finalStart && !finalEnd) {
      finalStart = new Date().toISOString();
      finalEnd = addTime(finalStart, limitRow.limit_unit, limitRow.limit_value);
    }

    // Set previous cooldowns for this limit to cleared
    await db.run('UPDATE cooldowns SET status = "available", cleared_at = CURRENT_TIMESTAMP WHERE limit_id = ? AND status = "cooldown"', [limit_id]);

    const result = await db.run(
      'INSERT INTO cooldowns (limit_id, status, started_at, ends_at, note) VALUES (?, "cooldown", ?, ?, ?)',
      [limit_id, finalStart, finalEnd, note]
    );

    res.json({ id: result.lastID, started_at: finalStart, ends_at: finalEnd });
  } catch (err) { next(err); }
});

// Clear cooldown
router.post('/clear', async (req, res, next) => {
  try {
    const { limit_id } = req.body;
    const db = await getDb();
    await db.run('UPDATE cooldowns SET status = "available", cleared_at = CURRENT_TIMESTAMP WHERE limit_id = ? AND status = "cooldown"', [limit_id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Manual update of cooldown
router.put('/:id', async (req, res, next) => {
  try {
    const { started_at, ends_at, status, note } = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE cooldowns SET started_at = ?, ends_at = ?, status = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [started_at, ends_at, status, note, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
