import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Oct", income: 8000, expenses: 5000 },
  { month: "Nov", income: 9000, expenses: 5500 },
  { month: "Dec", income: 7500, expenses: 4800 },
  { month: "Jan", income: 8500, expenses: 5300 },
  { month: "Feb", income: 9200, expenses: 6000 },
  { month: "Mar", income: 8800, expenses: 6200 },
];

export default function ChartComponent() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" stroke="#ddd" />
        <YAxis stroke="#ddd" />
        <Tooltip />
        <Bar dataKey="income" fill="#22c55e" />
        <Bar dataKey="expenses" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
