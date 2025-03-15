import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { auth } from "../../lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TransactionForm({ isOpen, closeModal, fetchTransactions, transaction }) {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const [categories, setCategories] = useState(["Food", "Transport", "Entertainment"]);
  const [newCategory, setNewCategory] = useState("");
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: "",
      });
    }
  }, [transaction]);

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
        transaction ? `${API_URL}/api/transactions/${transaction.id}` : `${API_URL}/api/transactions`,
        {
          method: transaction ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        closeModal();
        fetchTransactions(user.uid);
        resetForm(); // Reset the form after submission
      } else {
        console.error("Error adding/updating transaction:", data);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  // Reset form state
  function resetForm() {
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: "",
    });
    setNewCategory(""); // Reset new category input
    setIsNewCategoryModalOpen(false); // Close the new category modal
    setIsDropdownOpen(false); // Close the category dropdown
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" open={isOpen} onClose={closeModal}>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
          <Dialog.Title className="text-lg font-bold text-white mb-4">
            {transaction ? "Edit Transaction" : "Add New Transaction"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400">Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
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
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {transaction ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* New Category Modal */}
      <Transition appear show={isNewCategoryModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" open={isNewCategoryModalOpen} onClose={() => setIsNewCategoryModalOpen(false)}>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <Dialog.Title className="text-lg font-bold text-white mb-4">
              Add New Category
            </Dialog.Title>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none"
              placeholder="Enter new category name"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleNewCategorySubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
              >
                Add Category
              </button>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Transition>
  );
}
