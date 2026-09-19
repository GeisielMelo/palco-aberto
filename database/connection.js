const path = require('path');
const Database = require('better-sqlite3');
const { criarTabelas } = require('./schema');

const db = new Database(path.join(__dirname, '..', 'database.sqlite'));
db.pragma('foreign_keys = ON');
criarTabelas(db);

module.exports = db;
