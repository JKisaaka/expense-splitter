const express = require("express");
const cors = require("cors");
const { calculateBalances, splitBalances, settleDebts } = require("./balances");
const db = require("./db");

const app = express();
app.use(cors());
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

app.post("/groups/:id/expenses", (req, res) => {
  const groupId = req.params.id;
  const { paidBy, amount, description, splitAmong } = req.body;

  const insertExpense = db.prepare(
    "INSERT INTO expenses (group_id, paid_by, description, amount) VALUES (?, ?, ?, ?)"
  );
  const insertShare = db.prepare(
    "INSERT INTO expense_shares (expense_id, member_id) VALUES (?, ?)"
  );

  const save = db.transaction(() => {
    const result = insertExpense.run(groupId, paidBy, description, amount);
    for (const memberId of splitAmong) {
      insertShare.run(result.lastInsertRowid, memberId);
    }
    return result.lastInsertRowid;
  });

  const id = save();
  res.json({ id: Number(id), group_id: Number(groupId), paidBy, amount, description, splitAmong });
});

app.get("/groups/:id/settle", (req, res) => {
  const groupId = req.params.id;

  const members = db
    .prepare("SELECT id, name FROM members WHERE group_id = ?")
    .all(groupId);
  const nameById = {};
  for (const m of members) nameById[m.id] = m.name;

  const rows = db
    .prepare("SELECT id, paid_by, amount FROM expenses WHERE group_id = ?")
    .all(groupId);

  const getShares = db.prepare(
    "SELECT member_id FROM expense_shares WHERE expense_id = ?"
  );

  const expenses = rows.map((row) => ({
    paidBy: nameById[row.paid_by],
    amount: row.amount,
    splitAmong: getShares.all(row.id).map((s) => nameById[s.member_id]),
  }));

  const balances = calculateBalances(expenses);
  const { creditors, debtors } = splitBalances(balances);
  const payments = settleDebts(creditors, debtors);

  res.json({ balances, payments });
});

app.get("/groups/:id/expenses", (req, res) => {
  const groupId = req.params.id;

  const rows = db
    .prepare(
      `SELECT e.id, e.description, e.amount, m.name AS paid_by
       FROM expenses e
       JOIN members m ON m.id = e.paid_by
       WHERE e.group_id = ?
       ORDER BY e.id DESC`
    )
    .all(groupId);

  const getShares = db.prepare(
    `SELECT m.name
     FROM expense_shares s
     JOIN members m ON m.id = s.member_id
     WHERE s.expense_id = ?`
  );

  const expenses = rows.map((row) => ({
    ...row,
    sharedBy: getShares.all(row.id).map((s) => s.name),
  }));

  res.json(expenses);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});