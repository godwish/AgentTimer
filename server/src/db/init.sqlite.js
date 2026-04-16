const { getDb } = require('./database');

async function initDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_name TEXT NOT NULL,
      pc_name TEXT NOT NULL,
      project_name TEXT DEFAULT '',
      agent_id INTEGER NOT NULL,
      memo TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS profile_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      limit_unit TEXT NOT NULL, -- 'hour', 'day'
      limit_value INTEGER NOT NULL,
      remaining_percent INTEGER NOT NULL DEFAULT 100,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cooldowns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      limit_id INTEGER NOT NULL,
      status TEXT NOT NULL, -- 'available', 'cooldown', 'inactive'
      started_at DATETIME,
      ends_at DATETIME,
      cleared_at DATETIME,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (limit_id) REFERENCES profile_limits(id) ON DELETE CASCADE
    );
  `);

  // Migration: add remaining_percent if missing (for existing DBs)
  try {
    await db.exec(`ALTER TABLE profile_limits ADD COLUMN remaining_percent INTEGER NOT NULL DEFAULT 100`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Migration: add project_name if missing (for existing DBs)
  try {
    await db.exec(`ALTER TABLE profiles ADD COLUMN project_name TEXT DEFAULT ''`);
  } catch (e) {
    // Column already exists, ignore
  }

  console.log("Database initialized successfully.");
  await db.close();
}

if (require.main === module) {
  initDb().catch(err => {
    console.error("Failed to initialize db", err);
  });
}

module.exports = initDb;
