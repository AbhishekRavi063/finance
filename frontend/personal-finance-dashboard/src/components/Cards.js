export default function Dashboard() {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 p-6 flex flex-col">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-lg font-bold">
              AB
            </div>
            <div>
              <h2 className="text-lg font-semibold">abhishek1</h2>
              <p className="text-gray-400 text-sm">ID: 4</p>
            </div>
          </div>
          <nav className="mt-6">
            <ul className="space-y-3">
              {["Dashboard", "Transactions", "Net Worth", "Reports", "Settings"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="block py-2 px-3 rounded-md hover:bg-gray-700 transition"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button className="mt-auto bg-red-600 py-2 px-3 rounded-md hover:bg-red-700 transition flex items-center justify-center">
            Logout
          </button>
        </aside>
  
        {/* Main Dashboard */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-gray-400">Your financial overview for March 2025</p>
  
          {/* Header Actions */}
          <div className="flex justify-between items-center mt-6">
            <button className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center">
              + Add Transaction
            </button>
            <button className="bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-600 transition">
              This Month ▼
            </button>
          </div>
  
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <Card title="Total Income" value="$8,450.00" percentage="12%" up />
            <Card title="Total Expenses" value="$6,250.00" percentage="8%" down />
            <Card title="Net Worth" value="$125,350.00" percentage="7%" up />
          </div>
  
          {/* Income vs Expenses Chart */}
          <div className="bg-gray-800 p-6 rounded-md mt-6">
            <h2 className="text-xl font-semibold">Income vs Expenses</h2>
            <p className="text-gray-400 text-sm">Last 6 months comparison</p>
            <ChartComponent />
          </div>
        </main>
      </div>
    );
  }
  