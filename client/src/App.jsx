import { useEffect, useState } from "react";

const API = "http://localhost:3000";

function App() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  function loadGroups() {
    fetch(`${API}/groups`)
      .then((response) => response.json())
      .then((data) => setGroups(data));
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
    fetch(`${API}/groups/${group.id}/settle`)
      .then((response) => response.json())
      .then((data) => setResult(data));
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