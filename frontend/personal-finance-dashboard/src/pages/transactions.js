import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaPlus, FaSearch } from "react-icons/fa";
import Layout from "@/app/layout";
import { supabase } from "../../lib/supabaseClient";
import { auth } from "../../lib/firebase"; // Adjust the path as needed

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Transactions() {
  const [isOpen, setIsOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const response = await fetch(`${API_URL}/api/transactions`);
      const data = await response.json();
      if (response.ok) {
        setTransactions(data);
      } else {
        console.error("Error fetching transactions:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }
  console.log("Form Data before submit:", formData);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.amount || !formData.date || !formData.description) {
        console.error("All fields are required!");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated");
        return;
    }

    console.log("Sending Firebase UID:", user.uid);

    try {
        const response = await fetch(`${API_URL}/api/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firebase_uid: user.uid, // ✅ Send firebase UID
                type: formData.type,
                category: formData.category,
                amount: parseFloat(formData.amount), // ✅ Ensure number format
                date: new Date(formData.date).toISOString(), // ✅ Ensure correct date format
                description: formData.description,
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            console.error("Error:", result.error);
            return;
        }

        console.log("Transaction added successfully:", result.transaction);
        setFormData({ type: "expense", category: "", amount: "", date: "", description: "" });
        fetchTransactions();
        closeModal();
    } catch (error) {
        console.error("Network error:", error);
    }
};

  return (
    <Layout>
      <div className="bg-darkCard p-6 rounded-lg border border-darkBorder bg-gray-900">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-gray-400">Manage your income and expenses</p>

        <div className="flex items-center justify-between mt-4">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full p-2 pl-8 rounded-md bg-gray-700 text-white focus:outline-none"
            />
            <FaSearch className="absolute top-3 left-2 text-gray-400" />
          </div>
          <button
            onClick={openModal}
            className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Add Transaction
          </button>
        </div>

        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          {transactions.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-400">No transactions found</p>
              <button
                onClick={openModal}
                className="mt-4 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-700"
              >
                + Add Your First Transaction
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {transactions.map((txn) => (
                <li
                  key={txn.id}
                  className="bg-gray-700 p-3 rounded-md text-white flex justify-between"
                >
                  <span>{txn.description}</span>
                  <span
                    className={txn.type === "expense" ? "text-red-500" : "text-green-500"}
                  >
                    ${txn.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <div className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-gray-900 p-6 rounded-lg">
                <Dialog.Title className="text-lg font-semibold text-white">
                  Add New Transaction
                </Dialog.Title>
                <p className="text-gray-400 text-sm">Enter transaction details below</p>

                <form onSubmit={handleSubmit}>
                  <div className="mt-4">
                    <label className="text-sm font-semibold">Transaction Type</label>
                    <select
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value.toLowerCase() })}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold">Amount</label>
                    <input
                      type="number"
                      placeholder="$ 0.00"
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold">Category</label>
                    <select
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      <option value="Food">Food</option>
                      <option value="Rent">Rent</option>
                      <option value="Salary">Salary</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold">Description</label>
                    <input
                      type="text"
                      placeholder="Enter description"
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold">Date</label>
                    <input
                      type="date"
                      className="w-full p-2 rounded-md bg-gray-700 text-white"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="submit"
                      className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Layout>
  );
}
