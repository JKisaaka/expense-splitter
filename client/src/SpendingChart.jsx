import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function SpendingChart({ expenses }) {
  const paid = {};
  const share = {};

  for (const e of expenses) {
    paid[e.paid_by] = (paid[e.paid_by] || 0) + e.amount;

    const each = e.amount / e.sharedBy.length;
    for (const person of e.sharedBy) {
      share[person] = (share[person] || 0) + each;
    }
  }

  const names = Array.from(new Set([...Object.keys(paid), ...Object.keys(share)]));

  const data = names.map((name) => ({
    name,
    Paid: Math.round(paid[name] || 0),
    "Fair share": Math.round(share[name] || 0),
  }));

  if (data.length === 0) {
    return <p className="muted">Add an expense to see the chart.</p>;
  }

  return (
    <div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Paid" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Fair share" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="muted">
        Where Paid is taller than Fair share, the group owes that person. Where
        it is shorter, they owe the group.
      </p>
    </div>
  );
}

export default SpendingChart;