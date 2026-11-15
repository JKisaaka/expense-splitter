const express = require("express");

const { calculateBalances, splitBalances, settleDebts } = require("./balances");

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

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});