import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { auth } from "../../lib/firebase";
import useStore from "../app/store/useStore"; // Import Zustand store

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TransactionForm({
  isOpen,
  closeModal,
  fetchTransactions,
  transaction,
}) {
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
  const [errors, setErrors] = useState({});

  const { isDarkMode } = useStore(); // Zustand state

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
      setIsNewCategoryModalOpen(true); // Open the modal for new category
    } else if (category !== formData.category) {
      setFormData({ ...formData, category });
    }
    setIsDropdownOpen(false);
  }

  function handleNewCategorySubmit() {
    if (newCategory.trim() !== "") {
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      setFormData({ ...formData, category: newCategory });
    }
    setNewCategory("");
    setIsNewCategoryModalOpen(false);
    setIsDropdownOpen(false);
  }

  function validateForm() {
    const errors = {};
    if (!formData.amount) errors.amount = "Amount is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.date) errors.date = "Date is required";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
        transaction
          ? `${API_URL}/api/transactions/${transaction.id}`
          : `${API_URL}/api/transactions`,
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
        resetForm();
      } else {
        console.error("Error adding/updating transaction:", data);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  function resetForm() {
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: "",
    });
    setNewCategory("");
    setIsNewCategoryModalOpen(false);
    setIsDropdownOpen(false);
    setErrors({});
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        open={isOpen}
        onClose={closeModal}
      >
        <div
          className={`p-6 rounded-lg shadow-lg w-96 ${
            isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
          }`}
        >
          <Dialog.Title className="text-lg font-bold mb-4">
            {transaction ? "Edit Transaction" : "Add New Transaction"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className={`w-full p-2 rounded border focus:outline-none ${
                  isDarkMode
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-gray-200 text-black border-gray-400"
                }`}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className={`w-full p-2 rounded border focus:outline-none ${
                  isDarkMode
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-gray-200 text-black border-gray-400"
                }`}
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
            </div>

            <div>
              <label
                className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} block`}
              >
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  className={`cursor-pointer w-full p-2 rounded border focus:outline-none text-left ${
                    isDarkMode
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-200 text-black border-gray-400"
                  }`}
                  onClick={() => setIsDropdownOpen((prevState) => !prevState)}
                >
                  {formData.category || "Select category"}
                </button>
                {isDropdownOpen && (
                  <div
                    className={`absolute w-full rounded mt-1 max-h-40 overflow-y-auto z-50 border ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                    }`}
                  >
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        className={`p-2 cursor-pointer hover:opacity-80 ${
                          isDarkMode
                            ? "text-white hover:bg-gray-700"
                            : "text-black hover:bg-gray-300"
                        }`}
                        onClick={() => handleCategoryChange(cat)}
                      >
                        {cat}
                      </div>
                    ))}
                    <div
                      className={`p-2 cursor-pointer ${
                        isDarkMode
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-400"
                      }`}
                      onClick={() => handleCategoryChange("add_new")}
                    >
                      + Add New Category
                    </div>
                  </div>
                )}
              </div>
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`w-full p-2 rounded border focus:outline-none ${
                  isDarkMode
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-gray-200 text-black border-gray-400"
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`w-full p-2 rounded border focus:outline-none ${
                  isDarkMode
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-gray-200 text-black border-gray-400"
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
            </div>
            <div className="flex justify-between">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                {transaction ? "Update" : "Add"} Transaction
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* New Category Modal */}
      <Transition show={isNewCategoryModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          open={isNewCategoryModalOpen}
          onClose={() => setIsNewCategoryModalOpen(false)}
        >
          <div
            className={`p-6 rounded-lg shadow-lg w-96 ${
              isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
            }`}
          >
            <Dialog.Title className="text-lg font-bold mb-4">Add New Category</Dialog.Title>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={`w-full p-2 rounded border focus:outline-none ${
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-gray-200 text-black border-gray-400"
              }`}
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleNewCategorySubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
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
