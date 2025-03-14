"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import Sidebar from "@/components/Sidebar";
import { supabase } from "../../lib/supabaseClient"; // Make sure to import your Supabase client

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

  const [isClient, setIsClient] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", value: 0 });
  const [newLiability, setNewLiability] = useState({ name: "", value: 0 });

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate totals only on the client-side
  const totalAssets = Object.values(assets).reduce((acc, val) => acc + val, 0);
  const totalLiabilities = Object.values(liabilities).reduce(
    (acc, val) => acc + val,
    0
  );
  const netWorth = totalAssets - totalLiabilities;

  const handleAddAsset = async () => {
    if (newAsset.name && newAsset.value > 0) {
      const updatedAssets = { ...assets, [newAsset.name]: newAsset.value };
      setAssets(updatedAssets);
      // Add asset to Supabase
      await supabase
        .from("assets")
        .upsert([{ user_id: "current_user_id", name: newAsset.name, value: newAsset.value }]); // Replace with actual user_id
      setNewAsset({ name: "", value: 0 });
      setShowAssetModal(false); // Close modal
    }
  };

  const handleAddLiability = async () => {
    if (newLiability.name && newLiability.value > 0) {
      const updatedLiabilities = { ...liabilities, [newLiability.name]: newLiability.value };
      setLiabilities(updatedLiabilities);
      // Add liability to Supabase
      await supabase
        .from("liabilities")
        .upsert([{ user_id: "current_user_id", name: newLiability.name, value: newLiability.value }]); // Replace with actual user_id
      setNewLiability({ name: "", value: 0 });
      setShowLiabilityModal(false); // Close modal
    }
  };

  if (!isClient) {
    return null;
  }

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
          <StatCard
            title="Total Assets"
            amount={`$${totalAssets.toLocaleString()}`}
            color="text-green-500"
          />
          <StatCard
            title="Total Liabilities"
            amount={`$${totalLiabilities.toLocaleString()}`}
            color="text-red-500"
          />
          <StatCard
            title="Net Worth"
            amount={`$${netWorth.toLocaleString()}`}
            color="text-blue-500"
          />
        </div>

        {/* Add Asset and Liability Buttons */}
        <div className="mt-6">
          <button
            onClick={() => setShowAssetModal(true)}
            className="bg-green-500 text-white p-2 rounded-md mr-4"
          >
            Add Asset
          </button>
          <button
            onClick={() => setShowLiabilityModal(true)}
            className="bg-red-500 text-white p-2 rounded-md"
          >
            Add Liability
          </button>
        </div>

        {/* Breakdown Section */}
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md text-gray-800">
          <h3 className="text-gray-600 font-semibold">Breakdown</h3>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Value</th>
                </tr>
              </thead>
              <tbody>
                {/* Assets Breakdown */}
                {Object.entries(assets).map(([key, value]) => (
                  <tr key={key} className="bg-gray-100 border-b">
                    <td className="px-4 py-2 text-sm text-gray-700">Asset</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{key}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">${value.toLocaleString()}</td>
                  </tr>
                ))}
                {/* Liabilities Breakdown */}
                {Object.entries(liabilities).map(([key, value]) => (
                  <tr key={key} className="bg-gray-200 border-b">
                    <td className="px-4 py-2 text-sm text-gray-700">Liability</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{key}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">${value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Modal */}
        {showAssetModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-75">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold text-gray-200">Add New Asset</h3>
              <input
                type="text"
                placeholder="Asset Name"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                className="mt-2 p-2 w-full border border-gray-600 rounded-md bg-gray-700 text-white"
              />
              <input
                type="number"
                placeholder="Asset Value"
                value={newAsset.value}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, value: parseFloat(e.target.value) })
                }
                className="mt-2 p-2 w-full border border-gray-600 rounded-md bg-gray-700 text-white"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddAsset}
                  className="bg-green-500 text-white p-2 rounded-md"
                >
                  Add Asset
                </button>
                <button
                  onClick={() => setShowAssetModal(false)}
                  className="ml-2 bg-gray-600 text-white p-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liability Modal */}
        {showLiabilityModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-75">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold text-gray-200">Add New Liability</h3>
              <input
                type="text"
                placeholder="Liability Name"
                value={newLiability.name}
                onChange={(e) =>
                  setNewLiability({ ...newLiability, name: e.target.value })
                }
                className="mt-2 p-2 w-full border border-gray-600 rounded-md bg-gray-700 text-white"
              />
              <input
                type="number"
                placeholder="Liability Value"
                value={newLiability.value}
                onChange={(e) =>
                  setNewLiability({ ...newLiability, value: parseFloat(e.target.value) })
                }
                className="mt-2 p-2 w-full border border-gray-600 rounded-md bg-gray-700 text-white"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddLiability}
                  className="bg-red-500 text-white p-2 rounded-md"
                >
                  Add Liability
                </button>
                <button
                  onClick={() => setShowLiabilityModal(false)}
                  className="ml-2 bg-gray-600 text-white p-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
