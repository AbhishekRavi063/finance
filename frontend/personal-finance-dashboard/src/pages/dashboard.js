"use client";

import { useEffect } from "react";
import { auth } from "../../lib/firebase";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import SummaryCard from "../components/SummaryCard";
import { FaArrowUp, FaArrowDown, FaBalanceScale } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { useRouter } from 'next/router';
import { fetchAssets, fetchLiabilities } from "../app/utils/assetsandliabilitiesapi";
import { fetchTransactions } from "../app/utils/transactionaspi";
import useStore from '../app/store/useStore';  // Import Zustand store

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const {
    user, assets, liabilities, transactions, selectedMonth, selectedCategory,
    setUser, setAssets, setLiabilities, setTransactions, setSelectedMonth, setSelectedCategory, isDarkMode, setDarkMode
  } = useStore();  // Using Zustand state and actions

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Fetch data using helper functions
        setAssets(await fetchAssets(user.uid));
        setLiabilities(await fetchLiabilities(user.uid));
        console.log("🔥 Logged-in User UID:", user.uid); // Debugging

        try {
          const transactionData = await fetchTransactions(user.uid);
          setTransactions(transactionData);
          console.log("📝 All Transactions:", transactionData); // ✅ Console log all transactions
        } catch (error) {
          console.error("❌ Error fetching data:", error);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router, setUser, setAssets, setLiabilities, setTransactions]);

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

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#10b981"];

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Prepare data for the Income vs Expense chart (Last 6 Months)
  const lastSixMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const incomeExpensesData = lastSixMonths.map((month) => {
    const monthTransactions = filteredTransactions.filter(
      (t) => new Date(t.date).toLocaleString("default", { month: "short" }) === month
    );
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return { month, income, expenses };
  });

  // Prepare data for the Pie Chart (Expense Breakdown by Category)
  const expenseCategories = filteredTransactions.filter(t => t.type === 'expense');
  const categoryExpenseData = [...new Set(expenseCategories.map(t => t.category))].map(category => {
    const totalCategoryExpense = expenseCategories
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return { name: category, value: totalCategoryExpense };
  });

  // Prepare data for the Pie Chart (Income Breakdown by Category)
  const incomeCategories = filteredTransactions.filter(t => t.type === 'income');
  const categoryIncomeData = [...new Set(incomeCategories.map(t => t.category))].map(category => {
    const totalCategoryIncome = incomeCategories
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return { name: category, value: totalCategoryIncome };
  });

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);  // Toggle between true and false
  };

  return (
    <div
      className={`flex min-h-screen transition-all duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }  `}
    >
      <Sidebar />
      <main
        className={`flex-1 p-8 transition-all duration-300 pt-20 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-300"
        }`}
      >
        <h1 className={`text-xl font-semibold mb-6 transition-all duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>Dashboard</h1>
        <p className={`text-xl font-semibold mb-6 transition-all duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>Your financial overview</p>

        <DashboardHeader />

        <div className="flex flex-wrap md:flex-nowrap space-x-4 mt-4">
          {/* Month Filter */}
          <div className="flex flex-col w-full md:w-1/3">
            <label htmlFor="month" className="text-sm text-gray-300">
              Filter by Month
            </label>
            <select
              id="month"
              className={`p-2 border rounded transition-all duration-300 ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              } mt-4 cursor-pointer`}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col w-full md:w-1/3">
            <label htmlFor="category" className="text-sm text-gray-300">
              Filter by Category
            </label>
            <select
              id="category"
              className={`p-2 border rounded transition-all duration-300 ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              } mt-4 cursor-pointer`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <SummaryCard
            title="Total Income"
            value={`₹${totalIncome}`}
            percentage="12%"
            up
            icon={<FaArrowUp className="text-green-400 " />}
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            title="Total Expenses"
            value={`₹${totalExpenses}`}
            percentage="8%"
            down
            icon={<FaArrowDown className="text-red-400" />}
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            title="Net Worth"
            value={`₹${netWorth}`}
            percentage="7%"
            up
            icon={<FaBalanceScale className="text-blue-400" />}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Income vs Expenses Chart */}
        <div
          className={`mt-6 p-6 rounded-md shadow-lg border transition-all duration-300 ${
            isDarkMode
              ? "border-gray-600 bg-gray-900"
              : "border-gray-300 bg-gray-100"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-6 transition-all duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Income vs. Expenses (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeExpensesData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#444" : "#ccc"}
              />
              <XAxis dataKey="month" stroke={isDarkMode ? "#ddd" : "#333"} />
              <YAxis stroke={isDarkMode ? "#ddd" : "#333"} />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" />
              <Bar dataKey="expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown Chart */}
        <div
          className={`mt-6 p-6 rounded-md shadow-lg border transition-all duration-300 ${
            isDarkMode
              ? "border-gray-600 bg-gray-900"
              : "border-gray-300 bg-gray-100"
          }`}
        >
          <h2 className={`text-xl font-semibold mb-6 transition-all duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
            Expense Breakdown by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryExpenseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categoryExpenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Income Breakdown by Category */}
        <div
          className={`mt-6 p-6 rounded-md shadow-lg border transition-all duration-300 ${
            isDarkMode
              ? "border-gray-600 bg-gray-900"
              : "border-gray-300 bg-gray-100"
          }`}
        >
          <h2 className={`text-xl font-semibold mb-6 transition-all duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
            Income Breakdown by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryIncomeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#22c55e"
                label
              >
                {categoryIncomeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
