function calculateBalances(expenses) {
  const balances = {};

  for (const expense of expenses) {
    const share = expense.amount / expense.splitAmong.length;

    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

    for (const person of expense.splitAmong) {
      balances[person] = (balances[person] || 0) - share;
    }
  }

  return balances;
}

function splitBalances(balances) {
  const creditors = [];
  const debtors = [];

  for (const name in balances) {
    const amount = balances[name];
    if (amount > 0) {
      creditors.push({ name, amount });
    } else if (amount < 0) {
      debtors.push({ name, amount: -amount });
    }
  }

  return { creditors, debtors };
}

function settleDebts(creditors, debtors) {
  const payments = [];

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payment = Math.min(debtors[i].amount, creditors[j].amount);

    payments.push({
      from: debtors[i].name,
      to: creditors[j].name,
      amount: payment,
    });

    debtors[i].amount -= payment;
    creditors[j].amount -= payment;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return payments;
}

const testExpenses = [
  { paidBy: "Amina", amount: 4000, splitAmong: ["Amina", "Brian", "Chege", "Dan"] },
  { paidBy: "Brian", amount: 2000, splitAmong: ["Amina", "Brian", "Chege", "Dan"] },
];

const { creditors, debtors } = splitBalances(calculateBalances(testExpenses));
console.log(settleDebts(creditors, debtors));