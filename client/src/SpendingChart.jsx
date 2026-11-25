import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function SpendingChart({ expenses }) {
  const totals = {};
  for (const e of expenses) {
    totals[e.paid_by] = (totals[e.paid_by] || 0) + e.amount;
  }

  const data = Object.keys(totals).map((name) => ({
    name,
    paid: totals[name],
  }));

  if (data.length === 0) {
    return <p className="muted">Add an expense to see the chart.</p>;
  }

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="paid" fill="#4f46e5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;