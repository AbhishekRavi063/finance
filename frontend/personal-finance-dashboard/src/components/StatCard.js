export default function StatCard({ title, amount, color }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-gray-600 font-semibold">{title}</h3>
        <p className={`text-2xl font-bold ${color}`}>{amount}</p>
      </div>
    );
  }
  