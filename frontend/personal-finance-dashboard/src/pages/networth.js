"use client";

import { useState } from "react";
import StatCard from "@/components/StatCard"; 
import Sidebar from "@/components/Sidebar";

export default function NetWorth() {
  const [assets, setAssets] = useState({
    bank: 100000,
    investments: 250000,
    property: 80500,
  });

  const [liabilities, setLiabilities] = useState({
    loans: 200000,
    creditCard: 105150,
  });

  // Calculate totals
  const totalAssets = Object.values(assets).reduce((acc, val) => acc + val, 0);
  const totalLiabilities = Object.values(liabilities).reduce((acc, val) => acc + val, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold">Net Worth</h1>
        <p className="text-gray-400">Track your assets and liabilities</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <StatCard title="Total Assets" amount={`$${totalAssets.toLocaleString()}`} color="text-green-500" />
          <StatCard title="Total Liabilities" amount={`$${totalLiabilities.toLocaleString()}`} color="text-red-500" />
          <StatCard title="Net Worth" amount={`$${netWorth.toLocaleString()}`} color="text-blue-500" />
        </div>

        {/* Breakdown Section */}
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md text-gray-800">
          <h3 className="text-gray-600 font-semibold">Breakdown</h3>
          <div className="grid grid-cols-2 gap-6 mt-4">
            {/* Assets Breakdown */}
            <div>
              <h4 className="text-lg font-semibold text-green-500">Assets</h4>
              <ul className="mt-2">
                {Object.entries(assets).map(([key, value]) => (
                  <li key={key} className="flex justify-between py-1">
                    <span className="capitalize">{key}</span>
                    <span>${value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liabilities Breakdown */}
            <div>
              <h4 className="text-lg font-semibold text-red-500">Liabilities</h4>
              <ul className="mt-2">
                {Object.entries(liabilities).map(([key, value]) => (
                  <li key={key} className="flex justify-between py-1">
                    <span className="capitalize">{key}</span>
                    <span>${value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Financial Growth Chart Placeholder */}
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-gray-600 font-semibold">Net Worth Trend</h3>
          <p className="text-gray-500">Your financial growth over time</p>
          <div className="h-64 bg-gradient-to-b from-blue-500 to-transparent rounded-lg mt-4"></div>
        </div>
      </main>
    </div>
  );
}
