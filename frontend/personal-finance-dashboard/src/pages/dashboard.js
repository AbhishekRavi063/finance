import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { fetchNetWorth } from "../../lib/queries";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import SummaryCard from "../components/SummaryCard";
import { FaArrowUp, FaArrowDown, FaBalanceScale } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useRouter } from 'next/router'; // Import useRouter


const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [netWorth, setNetWorth] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        console.log("🔥 Logged-in User UID:", user.uid); // Debugging
        
        // Directly call the API to fetch transactions for the logged-in user
        try {
          const response = await fetch(`${API_URL}/api/transactions?firebase_uid=${user.uid}`);
          const data = await response.json();
          if (response.ok) {
            setTransactions(data);
            console.log("📝 All Transactions:", data); // ✅ Console log all transactions
          } else {
            console.error("Error fetching transactions:", data.error);
          }

        
        } catch (error) {
          console.error("❌ Error fetching data:", error);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);


  const months = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const categories = ["All", ...new Set(transactions.map((t) => t.category))];

  const filteredTransactions = transactions.filter((t) => {
    const transactionMonth = new Date(t.date).toLocaleString("default", { month: "short" });
    return (
      (selectedMonth === "All" || transactionMonth === selectedMonth) &&
      (selectedCategory === "All" || t.category === selectedCategory)
    );
  });

  

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  console.log("Total Income:", totalIncome);
  console.log("Total Expenses:", totalExpenses);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#10b981"];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-gray-400">Your financial overview</p>

        <DashboardHeader />

        <div className="flex space-x-4 mt-4">
          <select
            className="p-2 border rounded bg-gray-800 text-white"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded bg-gray-800 text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <SummaryCard title="Total Income" value={`₹${totalIncome}`} percentage="12%" up icon={<FaArrowUp className="text-green-400" />} />
          <SummaryCard title="Total Expenses" value={`₹${totalExpenses}`} percentage="8%" down icon={<FaArrowDown className="text-red-400" />} />
          <SummaryCard title="Net Worth" value={`₹${netWorth?.value || 0}`} percentage="7%" up icon={<FaBalanceScale className="text-blue-400" />} />
        </div>

        <div className="mt-6 bg-gray-800 p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Income vs. Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredTransactions}>
              <XAxis dataKey="date" stroke="#ddd" />
              <YAxis stroke="#ddd" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#4CAF50" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 bg-gray-800 p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Expense Breakdown by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={filteredTransactions} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100}>
                {filteredTransactions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        
      </main>
    </div>
  );
}
