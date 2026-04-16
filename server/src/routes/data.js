const express = require('express');
const { getDb } = require('../db/database');
const router = express.Router();

// Export all data as JSON
router.get('/export', async (req, res, next) => {
  try {
    const db = await getDb();
    const agents = await db.all('SELECT * FROM agents');
    const profiles = await db.all('SELECT * FROM profiles');
    const profile_limits = await db.all('SELECT * FROM profile_limits');
    const cooldowns = await db.all('SELECT * FROM cooldowns');

    res.json({
      version: 1,
      exported_at: new Date().toISOString(),
      agents,
      profiles,
      profile_limits,
      cooldowns
    });
  } catch (err) { next(err); }
});

// Import data from JSON (replaces all existing data)
router.post('/import', async (req, res, next) => {
  try {
    const { agents, profiles, profile_limits, cooldowns } = req.body;
    const db = await getDb();

    // Clear existing data in reverse dependency order
    await db.run('DELETE FROM cooldowns');
    await db.run('DELETE FROM profile_limits');
    await db.run('DELETE FROM profiles');
    await db.run('DELETE FROM agents');

    // Reset autoincrement counters
    await db.run("DELETE FROM sqlite_sequence WHERE name IN ('agents','profiles','profile_limits','cooldowns')");

    // Insert agents
    for (const a of (agents || [])) {
      await db.run(
        'INSERT INTO agents (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [a.id, a.name, a.description, a.created_at, a.updated_at]
      );
    }

    // Insert profiles
    for (const p of (profiles || [])) {
      await db.run(
        'INSERT INTO profiles (id, account_name, pc_name, project_name, agent_id, memo, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.account_name, p.pc_name, p.project_name || '', p.agent_id, p.memo, p.is_active, p.created_at, p.updated_at]
      );
    }

    // Insert profile_limits
    for (const pl of (profile_limits || [])) {
      await db.run(
        'INSERT INTO profile_limits (id, profile_id, limit_unit, limit_value, remaining_percent) VALUES (?, ?, ?, ?, ?)',
        [pl.id, pl.profile_id, pl.limit_unit, pl.limit_value, pl.remaining_percent ?? 100]
      );
    }

    // Insert cooldowns
    for (const c of (cooldowns || [])) {
      await db.run(
        'INSERT INTO cooldowns (id, limit_id, status, started_at, ends_at, cleared_at, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.limit_id, c.status, c.started_at, c.ends_at, c.cleared_at, c.note, c.created_at, c.updated_at]
      );
    }

    res.json({ success: true, imported: { agents: agents?.length || 0, profiles: profiles?.length || 0, profile_limits: profile_limits?.length || 0, cooldowns: cooldowns?.length || 0 } });
  } catch (err) { next(err); }
});

module.exports = router;
