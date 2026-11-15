const Database = require("better-sqlite3");

const db = new Database("expenses.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS expense_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL REFERENCES expense_groups(id),
    name TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL REFERENCES expense_groups(id),
    paid_by INTEGER NOT NULL REFERENCES members(id),
    description TEXT,
    amount INTEGER NOT NULL
  )
`);

module.exports = db;