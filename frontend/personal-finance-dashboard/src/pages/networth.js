import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import Sidebar from "@/components/Sidebar";
import { auth } from "../../lib/firebase";
import { Dialog, Transition } from "@headlessui/react";
import { FaTrash, FaEdit, FaPlus, FaEye } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NetWorth() {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemType, setItemType] = useState(""); // 'asset' or 'liability'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        fetchAssets(user.uid);
        fetchLiabilities(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  async function fetchAssets(userId) {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/api/assets?firebase_uid=${userId}`);
      const data = await response.json();
      if (response.ok) setAssets(data);
      else console.error("Error fetching assets:", data.error);
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  async function fetchLiabilities(userId) {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/api/liabilities?firebase_uid=${userId}`);
      const data = await response.json();
      if (response.ok) setLiabilities(data);
      else console.error("Error fetching liabilities:", data.error);
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  

  async function deleteItem(id, type) {
    const user = auth.currentUser;
    if (!user) return;
  
    // Correct pluralization for "liability"
    const endpoint = type === "liability" ? "liabilities" : "assets";
  
    try {
      const response = await fetch(`${API_URL}/api/${endpoint}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebase_uid: user.uid }),
      });
  
      const textResponse = await response.text();
      console.log("Raw API Response:", textResponse);
  
      if (!response.ok) {
        throw new Error(`Failed to delete: ${textResponse}`);
      }
  
      type === "asset" ? fetchAssets(user.uid) : fetchLiabilities(user.uid);
    } catch (error) {
      console.error("Network error:", error);
    }
  }
  
  

  function openModal(type, item = null) {
    setEditingItem(
      item || { description: "", value: "", amount: "" }
    );
    setItemType(type);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingItem(null);
  }



  async function handleSave() {
    const user = auth.currentUser;
    if (!user) return;
  
    const url = editingItem?.id
    ? `${API_URL}/api/${itemType === "asset" ? "assets" : "liabilities"}/${editingItem.id}` // Append ID for updates
    :  `${API_URL}/api/${itemType === "asset" ? "assets" : "liabilities"}`; // Use this for new assets

    const method = editingItem?.id ? "PUT" : "POST";
  
    const payload = {
      firebase_uid: user.uid,
      description: editingItem.description,
      type: itemType,
    };
  
    if (itemType === "asset") {
      payload.value = Number(editingItem.value || 0);
    } else {
      payload.amount = Number(editingItem.amount || 0);
    }
  
    if (editingItem?.id) {
      payload.id = editingItem.id;
    }
  
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      console.log("API Response Status:", response.status);
      console.log("API Response Headers:", response.headers.get("content-type"));
  
      // Attempt to parse JSON only if the response is JSON
      const textResponse = await response.text();
      console.log("Raw API Response:", textResponse);
  
      if (!response.ok) {
        throw new Error("Failed to save: " + textResponse);
      }
  
      const data = JSON.parse(textResponse); // Convert to JSON if valid
      console.log("Parsed API Response:", data);
  
      closeModal();
      itemType === "asset" ? fetchAssets(user.uid) : fetchLiabilities(user.uid);
    } catch (error) {
      console.error("Network error:", error);
    }
  }
  
  
  

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold">Net Worth</h1>
        <p className="text-gray-400">Track your assets and liabilities</p>

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

        <div className="mt-6 p-6 bg-gray-800 rounded-lg shadow-md">
          
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => openModal("asset")}
              className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <FaPlus /> Add Asset
            </button>
            <button
              onClick={() => openModal("liability")}
              className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <FaPlus /> Add Liability
            </button>
          </div>
          
          <h3 className="text-gray-400 font-semibold text-lg">Breakdown</h3>

          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-900 text-gray-300">
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...assets, ...liabilities].map((item) => (
                  <tr
                    key={item.id}
                    className="bg-gray-700 border-b border-gray-800"
                  >
                    <td className="p-3 text-left">
                      {item.type === "asset" ? "Asset" : "Liability"}
                    </td>
                    <td className="p-3 text-left">{item.description}</td>
                    <td className="p-3 text-left">
                      ${item.value || item.amount}
                    </td>
                    <td className="p-3 flex justify-center space-x-3">
                      <button
                        onClick={() => openModal(item.type, item)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id, item.type)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Transition appear show={modalOpen} as="div">
          <Dialog
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            open={modalOpen}
            onClose={closeModal}
          >
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
              <Dialog.Title className="text-lg font-bold text-white mb-4">
                {editingItem?.id ? "Edit" : "Add"} {itemType}
              </Dialog.Title>

              <input
                type="text"
                placeholder="Description"
                value={editingItem?.description ?? ""}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded text-white"
              />

              <input
                type="number"
                placeholder="Amount"
                value={
                  editingItem?.[itemType === "asset" ? "value" : "amount"] ?? ""
                }
                onChange={(e) => {
                  const newValue =
                    e.target.value === "" ? "" : Number(e.target.value);
                  setEditingItem({
                    ...editingItem,
                    [itemType === "asset" ? "value" : "amount"]: newValue,
                  });
                }}
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded text-white"
              />

              {/* Button Container */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </Dialog>
        </Transition>
      </main>
    </div>
  );
}