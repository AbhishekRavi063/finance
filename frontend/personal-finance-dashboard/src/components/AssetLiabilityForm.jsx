import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { auth } from "../../lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AssetLiabilityForm({ 
  isOpen, 
  closeModal, 
  fetchData, 
  entry, 
  type // "asset" or "liability"
}) {
  const [formData, setFormData] = useState({
    description: "",
    value: "",
  });

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    } else {
      setFormData({
        description: "",
        value: "",
      });
    }
  }, [entry]);

  async function handleSubmit(e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const payload = {
      firebase_uid: user.uid,
      description: formData.description,
      value: parseFloat(formData.value),
    };

    const url = `${API_URL}/api/${type === "asset" ? "assets" : "liabilities"}`;
    const method = entry ? "PUT" : "POST";

    try {
      const response = await fetch(entry ? `${url}/${entry.id}` : url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        closeModal();
        fetchData(user.uid);
      } else {
        console.error(`Error adding/updating ${type}:`, data);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" open={isOpen} onClose={closeModal}>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
          <Dialog.Title className="text-lg font-bold text-white mb-4">
            {entry ? `Edit ${type === "asset" ? "Asset" : "Liability"}` : `Add New ${type === "asset" ? "Asset" : "Liability"}`}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none"
                placeholder="Enter description"
              />
            </div>
            <div>
              <label className="block text-gray-400">{type === "asset" ? "Value" : "Amount"}</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none"
                placeholder={`Enter ${type === "asset" ? "value" : "amount"}`}
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {entry ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </Transition>
  );
}
