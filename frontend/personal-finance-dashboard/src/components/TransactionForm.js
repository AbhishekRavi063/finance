import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { auth } from "../../lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NetWorthForm({ isOpen, closeModal, fetchNetWorth, asset }) {
  const [formData, setFormData] = useState({
    type: "asset",
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const [categories, setCategories] = useState(["Bank Account", "Investment", "Property"]);
  const [newCategory, setNewCategory] = useState("");
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    } else {
      setFormData({
        type: "asset",
        amount: "",
        category: "",
        description: "",
        date: "",
      });
    }
  }, [asset]);

  function handleCategoryChange(category) {
    if (category === "add_new") {
      setIsNewCategoryModalOpen(true);
    } else {
      setFormData({ ...formData, category });
    }
    setIsDropdownOpen(false);
  }

  function handleNewCategorySubmit() {
    if (newCategory.trim() !== "") {
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, category: newCategory });
    }
    setNewCategory("");
    setIsNewCategoryModalOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const payload = {
      firebase_uid: user.uid,
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    };

    try {
      const response = await fetch(
        asset ? `${API_URL}/api/networth/${asset.id}` : `${API_URL}/api/networth`,
        {
          method: asset ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        closeModal();
        fetchNetWorth(user.uid);
      } else {
        console.error("Error adding/updating asset:", data);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  async function handleDelete() {
    if (!asset) return;

    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/networth/${asset.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        closeModal();
        fetchNetWorth(user.uid);
      } else {
        console.error("Error deleting asset");
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
            {asset ? "Edit Asset/Liability" : "Add New Asset/Liability"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none"
              >
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400">Category</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none text-left"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {formData.category || "Select category"}
                </button>
                {isDropdownOpen && (
                  <div className="absolute w-full bg-gray-800 border border-gray-700 rounded mt-1 max-h-40 overflow-y-auto z-50">
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-700 text-white cursor-pointer"
                        onClick={() => handleCategoryChange(cat)}
                      >
                        {cat}
                      </div>
                    ))}
                    <div
                      className="p-2 text-blue-400 cursor-pointer hover:text-blue-300"
                      onClick={() => handleCategoryChange("add_new")}
                    >
                      + Add New Category
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-400">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none"
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
              {asset && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {asset ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </Transition>
  );
}
