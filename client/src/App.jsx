import { useEffect, useState } from "react";

const API = "http://localhost:3000";

function App() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState("");

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
    setPaidBy("");
    setSharedBy([]);
    setError("");
    loadMembers(group.id);
    loadSettlement(group.id);
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
    });
  }

  return (
    <div>
      <h1>Expense Splitter</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New group name"
        />
        <button type="submit">Add group</button>
      </form>

      <h2>Your groups</h2>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <button onClick={() => openGroup(group)}>{group.name}</button>
          </li>
        ))}
      </ul>

      {selected && (
        <div>
          <h2>{selected.name}</h2>

          <h3>Members</h3>
          {members.length === 0 && <p>No members yet.</p>}
          <ul>
            {members.map((m) => (
              <li key={m.id}>{m.name}</li>
            ))}
          </ul>
          <form onSubmit={handleAddMember}>
            <input
              value={memberName}
              onChange={(event) => setMemberName(event.target.value)}
              placeholder="New member name"
            />
            <button type="submit">Add member</button>
          </form>

          <h3>Add an expense</h3>
          <form onSubmit={handleAddExpense}>
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
            <p>Shared by:</p>
            {members.map((m) => (
              <label key={m.id}>
                <input
                  type="checkbox"
                  checked={sharedBy.includes(m.id)}
                  onChange={() => toggleShare(m.id)}
                />
                {m.name}{" "}
              </label>
            ))}
            {error && <p style={{ color: "crimson" }}>{error}</p>}
            <p>
              <button type="submit">Add expense</button>
            </p>
          </form>

          <h3>Who owes whom</h3>
          {!result && <p>Loading...</p>}
          {result && result.payments.length === 0 && <p>All settled up.</p>}
          {result &&
            result.payments.map((p, index) => (
              <p key={index}>
                {p.from} pays {p.to} {p.amount}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

export default App;