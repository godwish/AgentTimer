const express = require('express');
const { getDb } = require('../db/database');
const router = express.Router();

router.get('/list', async (req, res, next) => {
  try {
    const db = await getDb();
    
    const query = `
      SELECT 
        p.id as profile_id,
        p.account_name,
        p.pc_name,
        p.project_name,
        a.name as agent_name,
        p.is_active,
        p.memo,
        pl.id as limit_id,
        pl.limit_unit,
        pl.limit_value,
        pl.remaining_percent,
        c.id as cooldown_id,
        c.status as current_status,
        c.started_at,
        c.ends_at
      FROM profiles p
      LEFT JOIN agents a ON p.agent_id = a.id
      LEFT JOIN profile_limits pl ON p.id = pl.profile_id
      LEFT JOIN (
        SELECT * FROM cooldowns c1
        WHERE id = (SELECT MAX(id) FROM cooldowns c2 WHERE c2.limit_id = c1.limit_id)
      ) c ON pl.id = c.limit_id
      ORDER BY p.account_name, p.pc_name
    `;

    const rawList = await db.all(query);
    const now = new Date();

    const profileMap = {};

    rawList.forEach(item => {
      if (!profileMap[item.profile_id]) {
        profileMap[item.profile_id] = {
          profile_id: item.profile_id,
          account_name: item.account_name,
          pc_name: item.pc_name,
          project_name: item.project_name || '',
          agent_name: item.agent_name,
          is_active: item.is_active,
          memo: item.memo,
          limits: []
        };
      }

      if (item.limit_id) {
        let finalStatus = 'available';
        let remainingSeconds = 0;

        if (item.is_active === 0) {
          finalStatus = 'inactive';
        } else if (item.current_status === 'cooldown') {
          const endDt = new Date(item.ends_at);
          if (endDt > now) {
            finalStatus = 'cooldown';
            remainingSeconds = Math.floor((endDt - now) / 1000);
          } else {
            finalStatus = 'available';
          }
        } else {
          finalStatus = 'available';
        }

        profileMap[item.profile_id].limits.push({
          limit_id: item.limit_id,
          limit_unit: item.limit_unit,
          limit_value: item.limit_value,
          remaining_percent: item.remaining_percent,
          current_status: finalStatus,
          remaining_seconds: remainingSeconds,
          started_at: item.started_at,
          ends_at: item.ends_at
        });
      }
    });

    res.json(Object.values(profileMap));
  } catch(err) { next(err); }
});

module.exports = router;
