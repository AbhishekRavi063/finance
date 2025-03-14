import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import SummaryCard from "../components/SummaryCard";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import { FaArrowUp, FaArrowDown, FaWallet, FaBalanceScale } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-gray-400">Your financial overview for March 2025</p>

        <DashboardHeader />

        <div className="grid grid-cols-3 gap-6 mt-6">
          <SummaryCard title="Total Income" value="$8,450.00" percentage="12%" up icon={<FaArrowUp className="text-green-400" />} />
          <SummaryCard title="Total Expenses" value="$6,250.00" percentage="8%" down icon={<FaArrowDown className="text-red-400" />} />
          <SummaryCard title="Net Worth" value="$125,350.00" percentage="7%" up icon={<FaBalanceScale className="text-blue-400" />} />
        </div>

        <IncomeExpenseChart />
      </main>
    </div>
  );
}
