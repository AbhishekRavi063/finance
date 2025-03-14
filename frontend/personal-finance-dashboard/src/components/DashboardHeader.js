import { FaPlus, FaCalendarAlt } from "react-icons/fa";

export default function DashboardHeader() {
  return (
    <div className="flex justify-between items-center mt-6">
      <button className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center">
        <FaPlus className="mr-2" /> Add Transaction
      </button>
      <button className="bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-600 transition flex items-center">
        <FaCalendarAlt className="mr-2" /> This Month ▼
      </button>
    </div>
  );
}
