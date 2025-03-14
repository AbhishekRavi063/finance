import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import Sidebar from "@/components/Sidebar";
import { supabase } from "../../lib/supabaseClient"; // Ensure you have Supabase client
import { useRouter } from "next/router"; // Import useRouter
import { auth } from "../../lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NetWorth() {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [newAsset, setNewAsset] = useState({ name: "", value: 0 });
  const [newLiability, setNewLiability] = useState({ name: "", amount: 0 });
  const [user, setUser] = useState(null);  // Store user information
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        console.log("🔥 Logged-in User UID:", user.uid); // Debugging
  
        // Directly call the API to fetch assets and liabilities for the logged-in user
        try {
          // Fetch assets
          const assetsResponse = await fetch(`${API_URL}/api/assets?firebase_uid=${user.uid}`);
          const assetsData = await assetsResponse.json();
          if (assetsResponse.ok) {
            setAssets(assetsData);
            console.log("💰 All Assets:", assetsData); // ✅ Console log all assets
          } else {
            console.error("Error fetching assets:", assetsData.error);
          }
  
          // Fetch liabilities
          const liabilitiesResponse = await fetch(`${API_URL}/api/liabilities?firebase_uid=${user.uid}`);
          const liabilitiesData = await liabilitiesResponse.json();
          if (liabilitiesResponse.ok) {
            setLiabilities(liabilitiesData);
            console.log("💸 All Liabilities:", liabilitiesData); // ✅ Console log all liabilities
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

  // Calculate totals
  const totalAssets = assets.reduce((acc, asset) => acc + (asset.value || 0), 0);
  const totalLiabilities = liabilities.reduce(
    (acc, liability) => acc + (liability.amount || 0),
    0
  );
  const netWorth = totalAssets - totalLiabilities;

  const handleAddAsset = async () => {
    if (newAsset.name && newAsset.value > 0) {
      const updatedAssets = [...assets, { ...newAsset, user_id: "current_user_id" }];
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
    if (newLiability.name && newLiability.amount > 0) {
      const updatedLiabilities = [
        ...liabilities,
        { ...newLiability, user_id: "current_user_id" },
      ];
      setLiabilities(updatedLiabilities);
      // Add liability to Supabase
      await supabase
        .from("liabilities")
        .upsert([{ user_id: "current_user_id", name: newLiability.name, amount: newLiability.amount }]); // Replace with actual user_id
      setNewLiability({ name: "", amount: 0 });
      setShowLiabilityModal(false); // Close modal
    }
  };

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
                {assets.map((asset) => (
                  <tr key={asset.id} className="bg-gray-100 border-b">
                    <td className="px-4 py-2 text-sm text-gray-700">Asset</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{asset.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {asset.value && !isNaN(asset.value) ? `$${asset.value.toLocaleString()}` : "N/A"}
                    </td>
                  </tr>
                ))}
                {/* Liabilities Breakdown */}
                {liabilities.map((liability) => (
                  <tr key={liability.id} className="bg-gray-200 border-b">
                    <td className="px-4 py-2 text-sm text-gray-700">Liability</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{liability.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {liability.amount && !isNaN(liability.amount) ? `$${liability.amount.toLocaleString()}` : "N/A"}
                    </td>
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
                placeholder="Liability Amount"
                value={newLiability.amount}
                onChange={(e) =>
                  setNewLiability({ ...newLiability, amount: parseFloat(e.target.value) })
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
