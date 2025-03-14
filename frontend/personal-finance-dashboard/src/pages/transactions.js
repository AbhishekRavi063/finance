import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaTrash, FaEdit, FaEye } from "react-icons/fa";
import Layout from "@/app/layout";
import { auth } from "../../lib/firebase";
import TransactionForm from "../components/TransactionForm";
import { Dialog, Transition } from "@headlessui/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Transactions() {
  const [isOpen, setIsOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]); // Filtered results
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewTransaction, setViewTransaction] = useState(null);

  // Fetch user transactions when authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchTransactions(user.uid);
    });
    return () => unsubscribe();
  }, []);

  async function fetchTransactions(userId) {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/api/transactions?firebase_uid=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setTransactions(data);
        setFilteredTransactions(data); // Initialize filtered transactions
      } else {
        console.error("Error fetching transactions:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  async function deleteTransaction(transactionId) {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/transactions/${transactionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firebase_uid: user.uid }), // Pass the firebase_uid
      });

      if (response.ok) {
        await fetchTransactions(user.uid); // Refresh the transactions after deletion
      } else {
        const data = await response.json();
        console.error("Error deleting transaction:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredTransactions(
      transactions.filter(
        (txn) =>
          txn.description.toLowerCase().includes(query) ||
          txn.category.toLowerCase().includes(query) ||
          txn.amount.toString().includes(query)
      )
    );
  }

  function openModal(transaction = null) {
    setEditingTransaction(transaction);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setEditingTransaction(null);
  }

  function openViewModal(transaction) {
    setViewTransaction(transaction);
    setViewModalOpen(true);
  }

  function closeViewModal() {
    setViewModalOpen(false);
    setViewTransaction(null);
  }

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
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-2 pl-8 rounded-md bg-gray-700 text-white focus:outline-none"
            />
            <FaSearch className="absolute top-3 left-2 text-gray-400" />
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Add Transaction
          </button>
        </div>

        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          {filteredTransactions.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-400">No transactions found</p>
              <button
                onClick={() => openModal()}
                className="mt-4 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-700"
              >
                + Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300">
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Category</th>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-gray-700">
                      <td className="py-2 px-4">{txn.description}</td>
                      <td className={`py-2 px-4 ${txn.type === "expense" ? "text-red-500" : "text-green-500"}`}>
                        ${txn.amount}
                      </td>
                      <td className="py-2 px-4">{txn.category}</td>
                      <td className="py-2 px-4">{txn.date}</td>
                      <td className="py-2 px-4 flex space-x-3 justify-center">
                        <button onClick={() => openViewModal(txn)} className="text-blue-400 hover:text-blue-300">
                          <FaEye />
                        </button>
                        <button onClick={() => openModal(txn)} className="text-yellow-400 hover:text-yellow-300">
                          <FaEdit />
                        </button>
                        <button onClick={() => deleteTransaction(txn.id)} className="text-red-400 hover:text-red-300">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <TransactionForm
          isOpen={isOpen}
          closeModal={closeModal}
          fetchTransactions={fetchTransactions}
          transaction={editingTransaction}
        />

        {/* View Transaction Modal */}
        <Transition appear show={viewModalOpen} as="div">
          <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" open={viewModalOpen} onClose={closeViewModal}>
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
              <Dialog.Title className="text-lg font-bold text-white mb-4">
                Transaction Details
              </Dialog.Title>
              {viewTransaction && (
                <div className="text-gray-300 space-y-2">
                  <p><strong>Description:</strong> {viewTransaction.description}</p>
                  <p><strong>Amount:</strong> ${viewTransaction.amount}</p>
                  <p><strong>Type:</strong> {viewTransaction.type}</p>
                  <p><strong>Category:</strong> {viewTransaction.category}</p>
                  <p><strong>Date:</strong> {viewTransaction.date}</p>
                </div>
              )}
              <div className="mt-4 text-right">
                <button onClick={closeViewModal} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Close
                </button>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Layout>
  );
}
