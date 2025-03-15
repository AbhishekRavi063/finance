import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaTrash, FaEdit, FaEye, FaArrowUp, FaArrowDown } from "react-icons/fa"; // Add FaArrowUp and FaArrowDown here
import Sidebar from "../components/Sidebar";
import { auth } from "../../lib/firebase";
import TransactionForm from "../components/TransactionForm";
import { Dialog, Transition } from "@headlessui/react";
import useTransactionStore from "../app/store/useTransactionStore";
import { fetchTransactions, deleteTransaction } from "../app/utils/transactionaspi"; // Import the functions

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function Transactions() {
  const {
    transactions,
    setTransactions,
    setFilteredTransactions,
    setSearchQuery,
    filteredTransactions,
  } = useTransactionStore();

  const [isOpen, setIsOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewTransaction, setViewTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete confirmation modal states
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const [searchQuery, setSearchQueryState] = useState(''); // Use local state for the search query

  // Fetch user transactions when authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchUserTransactions(user.uid); // Use the new fetchTransactions function
    });
    return () => unsubscribe();
  }, []);

  async function fetchUserTransactions(userId) {
    const data = await fetchTransactions(userId); // Call the fetch function from API file
    setTransactions(data);
    setFilteredTransactions(data); // Initialize filtered transactions
  }

  async function handleDelete(transactionId) {
    const user = auth.currentUser;
    if (user) {
      const isDeleted = await deleteTransaction(transactionId, user.uid); // Call the delete function from API file
      if (isDeleted) {
        await fetchUserTransactions(user.uid); // Refresh the transactions after deletion
      }
    }
  }

  function handleSearch(e) {
    const query = e.target.value;
    setSearchQueryState(query);
    setSearchQuery(query); // Assuming your store's setSearchQuery function updates the filtered transactions
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

  function openDeleteConfirmationModal(transaction) {
    setTransactionToDelete(transaction);
    setDeleteConfirmationOpen(true);
  }

  function closeDeleteConfirmationModal() {
    setDeleteConfirmationOpen(false);
    setTransactionToDelete(null);
  }

  // Calculate Total Income and Total Expenses
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);


    const filteredTransactionss = transactions.filter(liability =>
      liability.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    // Pagination logic
    const totalItems = [...filteredTransactionss];
    const totalPages = Math.ceil(totalItems.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentItems = totalItems.slice(startIndex, startIndex + rowsPerPage);
  

  return (
    
      <div className="flex min-h-screen bg-gray-900 text-white mt-10">
        <Sidebar />
        <div className="flex-grow p-8">
          <h1 className="text-2xl font-bold text-amber-50">Transactions</h1>
          <p className="text-gray-400">Manage your income and expenses</p>

          {/* Summary Cards for Total Income and Total Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-800 p-6 rounded-md shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-300">Total Income</h3>
                <FaArrowUp className="text-green-400 text-2xl" />
              </div>
              <p className="mt-2 text-xl text-green-400">₹{totalIncome}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-md shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-300">Total Expenses</h3>
                <FaArrowDown className="text-red-400 text-2xl" />
              </div>
              <p className="mt-2 text-xl text-red-400">₹{totalExpenses}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery} // Bind value to searchQuery
                onChange={handleSearch}
                className="w-full p-2 pl-8 rounded-md bg-gray-700 text-white focus:outline-none"
              />
              <FaSearch className="absolute top-3 left-2 text-gray-400" />
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
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
                  className="mt-4 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-700 cursor-pointer"
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
                    {currentItems.map((txn) => (
                      <tr key={txn.id} className="border-b border-gray-700">
                        <td className="py-2 px-4">{txn.description}</td>
                        <td className={`py-2 px-4 ${txn.type === "expense" ? "text-red-500" : "text-green-500"}`}>
                          ₹{txn.amount}
                        </td>
                        <td className="py-2 px-4">{txn.category}</td>
                        <td className="py-2 px-4">{txn.date}</td>
                        <td className="py-2 px-4 flex space-x-3 justify-center">
                          <button onClick={() => openViewModal(txn)} className="text-blue-400 cursor-pointer hover:text-blue-300">
                            <FaEye />
                          </button>
                          <button onClick={() => openModal(txn)} className="text-yellow-400 cursor-pointer hover:text-yellow-300">
                            <FaEdit />
                          </button>
                          <button onClick={() => openDeleteConfirmationModal(txn)} className="text-red-400 cursor-pointer hover:text-red-300">
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
            fetchTransactions={fetchUserTransactions}
            transaction={editingTransaction}
          />

          {/* Rows per page dropdown */}
          <div className="flex justify-end mt-4">
            <label htmlFor="rows-per-page" className="text-white mr-2">Rows per page:</label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-1 rounded-md"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Previous
            </button>
            <div className="text-white">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Next
            </button>
          </div>
        

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
                    <p><strong>Amount:</strong> ₹{viewTransaction.amount}</p>
                    <p><strong>Type:</strong> {viewTransaction.type}</p>
                    <p><strong>Category:</strong> {viewTransaction.category}</p>
                    <p><strong>Date:</strong> {viewTransaction.date}</p>
                  </div>
                )}
                <div className="mt-4 text-right">
                  <button onClick={closeViewModal} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer">
                    Close
                  </button>
                </div>
              </div>
            </Dialog>
          </Transition>

          {/* Delete Confirmation Modal */}
          <Transition appear show={deleteConfirmationOpen} as="div">
            <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" open={deleteConfirmationOpen} onClose={closeDeleteConfirmationModal}>
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
                <Dialog.Title className="text-lg font-bold text-white mb-4">
                  Confirm Delete
                </Dialog.Title>
                <p className="text-gray-300">Are you sure you want to delete this transaction?</p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => {
                      if (transactionToDelete) {
                        handleDelete(transactionToDelete.id);
                      }
                      closeDeleteConfirmationModal();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={closeDeleteConfirmationModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      </div>
    
  );
}