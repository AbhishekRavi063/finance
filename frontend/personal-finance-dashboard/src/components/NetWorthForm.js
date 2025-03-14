import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { fetchNetWorth } from "../../lib/queries";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import SummaryCard from "../components/SummaryCard";
import { FaArrowUp, FaArrowDown, FaBalanceScale } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NetWorthPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [netWorth, setNetWorth] = useState(null);
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
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

          // Fetch net worth
          const netWorthData = await fetchNetWorth(user.uid);
          setNetWorth(netWorthData);

          // Fetch assets
          const assetsResponse = await fetch(`${API_URL}/api/assets?firebase_uid=${user.uid}`);
          const assetsData = await assetsResponse.json();
          if (assetsResponse.ok) {
            setAssets(assetsData);
            console.log("💰 All Assets:", assetsData);
          } else {
            console.error("Error fetching assets:", assetsData.error);
          }

          // Fetch liabilities
          const liabilitiesResponse = await fetch(`${API_URL}/api/liabilities?firebase_uid=${user.uid}`);
          const liabilitiesData = await liabilitiesResponse.json();
          if (liabilitiesResponse.ok) {
            setLiabilities(liabilitiesData);
            console.log("💳 All Liabilities:", liabilitiesData);
          } else {
            console.error("Error fetching liabilities:", liabilitiesData.error);
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

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

  const totalAssets = assets.reduce((sum, asset) => sum + (Number(asset.value) || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + (Number(liability.value) || 0), 0);

  console.log("Total Income:", totalIncome);
  console.log("Total Expenses:", totalExpenses);
  console.log("Total Assets:", totalAssets);
  console.log("Total Liabilities:", totalLiabilities);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#10b981"];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold">Net Worth Overview</h1>
        <p className="text-gray-400">Your financial health</p>

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
          <SummaryCard title="Total Assets" value={`₹${totalAssets}`} percentage="5%" up icon={<FaArrowUp className="text-green-400" />} />
          <SummaryCard title="Total Liabilities" value={`₹${totalLiabilities}`} percentage="10%" down icon={<FaArrowDown className="text-red-400" />} />
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

        <button onClick={handleLogout} className="mt-6 bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition">
          Logout
        </button>
      </main>
    </div>
  );
}
