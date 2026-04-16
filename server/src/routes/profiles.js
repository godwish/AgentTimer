const express = require('express');
const { getDb } = require('../db/database');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    const profiles = await db.all('SELECT * FROM profiles ORDER BY account_name, pc_name');
    res.json(profiles);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { account_name, pc_name, project_name, agent_id, memo, is_active, limits } = req.body;
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO profiles (account_name, pc_name, project_name, agent_id, memo, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
      [account_name, pc_name, project_name || '', agent_id, memo, is_active !== undefined ? is_active : 1]
    );

    const profileId = result.lastID;

    if (limits && Array.isArray(limits)) {
      for (const limit of limits) {
        await db.run(
          `INSERT INTO profile_limits (profile_id, limit_unit, limit_value) VALUES (?, ?, ?)`,
          [profileId, limit.limit_unit, limit.limit_value]
        );
      }
    }

    res.json({ id: profileId });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { account_name, pc_name, project_name, agent_id, memo, is_active, limits } = req.body;
    const db = await getDb();
    await db.run(
      `UPDATE profiles SET account_name = ?, pc_name = ?, project_name = ?, agent_id = ?, memo = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [account_name, pc_name, project_name || '', agent_id, memo, is_active, req.params.id]
    );

    // Simplest way to handle limits update: delete old and re-insert
    await db.run(`DELETE FROM profile_limits WHERE profile_id = ?`, [req.params.id]);
    
    if (limits && Array.isArray(limits)) {
      for (const limit of limits) {
        await db.run(
          `INSERT INTO profile_limits (profile_id, limit_unit, limit_value) VALUES (?, ?, ?)`,
          [req.params.id, limit.limit_unit, limit.limit_value]
        );
      }
    }

    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM profiles WHERE id = ?', [req.params.id]);
    // Cascade delete on profile_limits will handle cooldowns if explicitly coded or we can manual delete wait, PRAGMA foreign_keys = ON is needed.
    // To be safe, manual deletes:
    await db.run('DELETE FROM profile_limits WHERE profile_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
