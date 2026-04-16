const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDb() {
  return open({
    filename: process.env.DB_PATH || path.resolve(__dirname, '../../timer.sqlite'),
    driver: sqlite3.Database
  });
}

module.exports = {
  getDb
};
