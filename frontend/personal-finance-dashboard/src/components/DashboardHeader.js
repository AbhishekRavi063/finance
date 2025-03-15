import { FaPlus, FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <div className="flex justify-between items-center mt-6">
      <Link href={'/transactions'}>
        <button className="bg-blue-600 px-4 py-2 cursor-pointer rounded-md hover:bg-blue-700 transition flex items-center ml-0 sm:ml-4 md:ml-0">
          <FaPlus className="mr-2" /> Add Transaction
        </button>
      </Link>
    </div>
  );
}
