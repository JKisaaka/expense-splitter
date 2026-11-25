import { useEffect, useState } from "react";
import SpendingChart from "./SpendingChart";

const API = "http://localhost:3000";

function App() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [expenses, setExpenses] = useState([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [sharedBy, setSharedBy] = useState([]);
  const [error, setError] = useState("");

  function loadGroups() {
    fetch(`${API}/groups`)
      .then((response) => response.json())
      .then((data) => setGroups(data));
  }

  function loadMembers(groupId) {
    fetch(`${API}/groups/${groupId}/members`)
      .then((response) => response.json())
      .then((data) => setMembers(data));
  }

  function loadSettlement(groupId) {
    fetch(`${API}/groups/${groupId}/settle`)
      .then((response) => response.json())
      .then((data) => setResult(data));
  }

  function loadExpenses(groupId) {
    fetch(`${API}/groups/${groupId}/expenses`)
      .then((response) => response.json())
      .then((data) => setExpenses(data));
  }

  useEffect(() => {
    loadGroups();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    fetch(`${API}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(() => {
      setName("");
      loadGroups();
    });
  }

  function openGroup(group) {
    setSelected(group);
    setResult(null);
    setMembers([]);
    setExpenses([]);
    setPaidBy("");
    setSharedBy([]);
    setError("");
    loadMembers(group.id);
    loadSettlement(group.id);
    loadExpenses(group.id);
  }

  function handleDeleteGroup() {
    const sure = window.confirm(
      `Delete "${selected.name}" and all its members and expenses? This cannot be undone.`
    );
    if (!sure) return;

    fetch(`${API}/groups/${selected.id}`, { method: "DELETE" }).then(() => {
      setSelected(null);
      setResult(null);
      setMembers([]);
      setExpenses([]);
      loadGroups();
    });
  }

  function handleAddMember(event) {
    event.preventDefault();
    if (!memberName.trim()) return;

    fetch(`${API}/groups/${selected.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: memberName }),
    }).then(() => {
      setMemberName("");
      loadMembers(selected.id);
    });
  }

  function toggleShare(memberId) {
    if (sharedBy.includes(memberId)) {
      setSharedBy(sharedBy.filter((id) => id !== memberId));
    } else {
      setSharedBy([...sharedBy, memberId]);
    }
  }

  function handleAddExpense(event) {
    event.preventDefault();
    const value = Math.round(Number(amount));

    if (!paidBy) return setError("Choose who paid.");
    if (!(value > 0)) return setError("Enter an amount above zero.");
    if (sharedBy.length === 0)
      return setError("Tick at least one person who shares it.");
    setError("");

    fetch(`${API}/groups/${selected.id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paidBy: Number(paidBy),
        amount: value,
        description,
        splitAmong: sharedBy,
      }),
    }).then(() => {
      setDescription("");
      setAmount("");
      setSharedBy([]);
      loadSettlement(selected.id);
      loadExpenses(selected.id);
    });
  }

  return (
    <div>
      <div className="header">
        <h1>Expense Splitter</h1>
        <p className="subtitle">Split shared costs and see who owes whom.</p>
      </div>

      <div className="card">
        <h2>Your groups</h2>
        <div className="chips">
          {groups.map((group) => (
            <button
              key={group.id}
              className={
                selected && selected.id === group.id ? "chip active" : "chip"
              }
              onClick={() => openGroup(group)}
            >
              {group.name}
            </button>
          ))}
        </div>
        <form className="row" onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New group name"
          />
          <button type="submit">Add group</button>
        </form>
      </div>

      {selected && (
        <div>
          <div className="title-row">
            <h2 className="group-title">{selected.name}</h2>
            <button className="danger" onClick={handleDeleteGroup}>
              Delete group
            </button>
          </div>

          <div className="layout">
            <div>
              <div className="card">
                <h2>Members</h2>
                {members.length === 0 && <p className="muted">No members yet.</p>}
                <div className="pills">
                  {members.map((m) => (
                    <span className="pill" key={m.id}>
                      {m.name}
                    </span>
                  ))}
                </div>
                <form className="row" onSubmit={handleAddMember}>
                  <input
                    value={memberName}
                    onChange={(event) => setMemberName(event.target.value)}
                    placeholder="New member name"
                  />
                  <button type="submit">Add member</button>
                </form>
              </div>

              <div className="card">
                <h2>Add an expense</h2>
                <form className="stack" onSubmit={handleAddExpense}>
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What was it for?"
                  />
                  <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Amount"
                  />
                  <select
                    value={paidBy}
                    onChange={(event) => setPaidBy(event.target.value)}
                  >
                    <option value="">Who paid?</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <p className="label">Shared by</p>
                  <div className="checks">
                    {members.map((m) => (
                      <label key={m.id}>
                        <input
                          type="checkbox"
                          checked={sharedBy.includes(m.id)}
                          onChange={() => toggleShare(m.id)}
                        />
                        {m.name}
                      </label>
                    ))}
                  </div>
                  {error && <p className="error">{error}</p>}
                  <button type="submit">Add expense</button>
                </form>
              </div>
            </div>

            <div>
              <div className="card">
                <h2>Who owes whom</h2>
                {!result && <p className="muted">Loading...</p>}
                {result && result.payments.length === 0 && (
                  <p className="muted">All settled up.</p>
                )}
                {result &&
                  result.payments.map((p, index) => (
                    <div className="payment" key={index}>
                      <strong>{p.from}</strong> pays <strong>{p.to}</strong>
                      <span className="amount">{p.amount}</span>
                    </div>
                  ))}
              </div>

                            <div className="card">
                <h2>Spending</h2>
                <SpendingChart expenses={expenses} />
              </div>

              <div className="card">
                <h2>Expenses</h2>
                {expenses.length === 0 && (
                  <p className="muted">No expenses yet.</p>
                )}
                <ul className="expense-list">
                  {expenses.map((e) => (
                    <li className="expense" key={e.id}>
                      <div>
                        <strong>{e.description || "Expense"}</strong>
                        <small>
                          {e.paid_by} paid · shared by {e.sharedBy.join(", ")}
                        </small>
                      </div>
                      <span className="amount">{e.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;