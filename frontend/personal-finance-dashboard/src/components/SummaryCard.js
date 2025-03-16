export default function SummaryCard({ title, value, percentage, up, down, icon, isDarkMode }) {
  return (
    <div
      className={ `${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } p-4 rounded-lg shadow-md`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p
        className={`text-sm mt-1 ${
          up ? "text-green-400" : down ? "text-red-400" : "text-gray-400"
        }`}
      >
        {percentage && `${percentage}%`}
      </p>
    </div>
  );
}
