export default function SummaryCard({ title, value,  icon, isDarkMode, color }) {
  // Prevent overflow: truncate value if too long
  const formattedValue =
    value.toString().length > 10 ? `${value.toString().slice(0, 7)}...` : value;

  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p
        className={`text-3xl font-bold mt-2 truncate overflow-hidden ${color} text-ellipsis w-full block`}
        title={value} // Show full value on hover
      >
        {formattedValue}
      </p>
    </div>
  );
}
