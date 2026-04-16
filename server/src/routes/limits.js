const express = require('express');
const { getDb } = require('../db/database');
const router = express.Router();

// Update remaining_percent for a specific limit
router.patch('/:id/percent', async (req, res, next) => {
  try {
    const { remaining_percent } = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE profile_limits SET remaining_percent = ? WHERE id = ?',
      [remaining_percent, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
