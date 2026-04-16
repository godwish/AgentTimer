const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDb() {
  const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../data/timer.sqlite');
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

module.exports = {
  getDb
};
