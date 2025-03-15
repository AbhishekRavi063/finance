export default function SummaryCard({ title, value, percentage, up, down, icon }) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
        <p className={`text-sm mt-1 ${up ? "text-green-400" : "text-red-400"}`}>
          
        </p>
      </div>
    );
  }
  