# Expense Splitter

A group expense tracker. Friends add shared expenses, and the app works out who owes whom using as few payments as possible.

## How the settlement works

1. **Net balance:** for each person, total paid minus their share of everything. Positive means they are owed money, negative means they owe money.
2. **Split:** people owed money (creditors) and people who owe money (debtors) go into two lists.
3. **Match:** the biggest debtor pays the biggest creditor the smaller of the two amounts. Anyone who reaches zero is finished. This repeats until everyone is settled.

Example: Amina paid 4000 and Brian paid 2000 for a group of four (Amina, Brian, Chege, Dan). Three payments settle everything:

- Chege pays Amina 1500
- Dan pays Amina 1000
- Dan pays Brian 500

## Run it

You need Node.js installed.

    git clone https://github.com/JKisaaka/expense-splitter.git
    cd expense-splitter
    npm install
    node server.js

In a second terminal, start the web page:

    cd client
    npm install
    npm run dev

Then open http://localhost:5173.

## What works

- Create and delete groups, and add members
- Add expenses and choose who paid and who shares each one
- See each person's balance, and who owes whom, using the settlement algorithm
- Chart of what each person paid against their fair share
- List of past expenses for every group

## Built with

Node.js, Express, SQLite (better-sqlite3), React (Vite), Recharts

## Planned

- Mark a payment as settled
- Delete expenses and members
- Deploy online