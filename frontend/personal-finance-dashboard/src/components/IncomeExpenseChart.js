import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function IncomeExpenseChart({ data }) {
  return (
    <div className="bg-gray-800 p-6 rounded-md mt-6">
      <h2 className="text-xl font-semibold mb-2">Income vs Expenses</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#ddd" />
          <YAxis stroke="#ddd" />
          <Tooltip />
          <Bar dataKey="income" fill="#22c55e" />
          <Bar dataKey="expenses" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
