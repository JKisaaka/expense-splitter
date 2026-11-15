const express = require("express");
const { calculateBalances, splitBalances, settleDebts } = require("./balances");
const db = require("./db");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Expense Splitter API is running");
});

app.post("/settle", (req, res) => {
  const { expenses } = req.body;
  const balances = calculateBalances(expenses);
  const { creditors, debtors } = splitBalances(balances);
  const payments = settleDebts(creditors, debtors);

  res.json({ balances, payments });
});

app.post("/groups", (req, res) => {
  const { name } = req.body;
  const result = db
    .prepare("INSERT INTO expense_groups (name) VALUES (?)")
    .run(name);

  res.json({ id: result.lastInsertRowid, name });
});

app.get("/groups", (req, res) => {
  const groups = db.prepare("SELECT * FROM expense_groups").all();
  res.json(groups);
});

app.post("/groups/:id/members", (req, res) => {
  const { name } = req.body;
  const groupId = req.params.id;
  const result = db
    .prepare("INSERT INTO members (group_id, name) VALUES (?, ?)")
    .run(groupId, name);

  res.json({ id: result.lastInsertRowid, group_id: Number(groupId), name });
});

app.get("/groups/:id/members", (req, res) => {
  const members = db
    .prepare("SELECT * FROM members WHERE group_id = ?")
    .all(req.params.id);

  res.json(members);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});