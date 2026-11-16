import { useEffect, useState } from "react";

const API = "http://localhost:3000";

function App() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");

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
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;