import useStore from "../app/store/useStore"; // Import Zustand store for dark mode

export default function StatCard({ title, amount, color }) {
  const { isDarkMode } = useStore();

  const formattedAmount = amount.toString().length > 10 ? `${amount.toString().slice(0, 7)}...` : amount;

  return (
    <div
      className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <h3 className="font-semibold">{title}</h3>
      <p
        className={`text-2xl font-bold ${color} truncate overflow-hidden text-ellipsis w-full block`}
        title={amount} // Show full amount on hover
      >
        {formattedAmount}
      </p>
    </div>
  );
}
