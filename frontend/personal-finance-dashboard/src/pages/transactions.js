import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaTrash, FaEdit, FaEye, FaArrowUp, FaArrowDown } from "react-icons/fa"; // Add FaArrowUp and FaArrowDown here
import Sidebar from "../components/Sidebar";
import { auth } from "../../lib/firebase";
import TransactionForm from "../components/TransactionForm";
import { Dialog, Transition } from "@headlessui/react";
import useTransactionStore from "../app/store/useTransactionStore";
import { fetchTransactions, deleteTransaction } from "../app/utils/transactionaspi"; // Import the functions
import useStore from "../app/store/useStore"; // Import Zustand store
import SummaryCard from "../components/SummaryCard";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Transactions() {
  const {
    transactions,
    setTransactions,
    setFilteredTransactions,
    setSearchQuery,
    filteredTransactions,
  } = useTransactionStore();

  const { isDarkMode, setDarkMode } = useStore(); // Zustand state

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode); // Toggle between true (dark mode) and false (light mode)
  };



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
      if (user)
        fetchUserTransactions(user.uid); // Use the new fetchTransactions function
    });
    return () => unsubscribe();
  }, []);

  async function fetchUserTransactions(userId) {
    const data = await fetchTransactions(userId);
    const sortedData = data.sort((a,b) => new Date(b.date) - new Date(a.date)); // Sort by date in descending order
    setTransactions(sortedData);
    setFilteredTransactions(sortedData); // Initialize filtered transactions with sorted data
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
    <div
      className={`flex min-h-screen transition-all duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }  `}
    >
      <Sidebar />
      <div
        className={`flex-1 p-8 transition-all duration-300 pt-20 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-300"
        }`}
      >
        <h1
          className={`text-2xl font-bold transition-all duration-300 ${
            isDarkMode ? "text-amber-50" : "text-gray-900"
          }`}
        >
          Transactions
        </h1>
        <p
          className={`transition-all duration-300 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Manage your income and expenses
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <SummaryCard
            title="Total Income"
            value={`₹${totalIncome}`}
            percentage="12%"
            up
            icon={<FaArrowUp className="text-green-400 " />}
            isDarkMode={isDarkMode}
          />
          <SummaryCard
            title="Total Expenses"
            value={`₹${totalExpenses}`}
            percentage="8%"
            down
            icon={<FaArrowDown className="text-red-400" />}
            isDarkMode={isDarkMode}
          />
        </div>
        <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
          {/* Search Input Field */}
          <div className="relative w-full sm:w-1/2 lg:w-1/3">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery} // Bind value to searchQuery
              onChange={handleSearch}
              className={`w-full p-2 pl-8 rounded-md focus:outline-none transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            />
            <FaSearch
              className={`absolute top-3 left-2 transition-all duration-300 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
          </div>

          {/* Add Transaction Button */}
          <button
            onClick={() => openModal()}
            className={`px-4 py-2 rounded-md flex items-center cursor-pointer transition-all duration-300 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <FaPlus className="mr-2" /> Add Transaction
          </button>
        </div>
        <div
          className={`mt-6 p-6 rounded-lg transition-all duration-300 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-200"
          }`}
        >
          {filteredTransactions.length === 0 ? (
            <div className="text-center">
              <p
                className={`transition-all duration-300 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No transactions found
              </p>
              <button
                onClick={() => openModal()}
                className={`mt-4 px-4 py-2 rounded-md cursor-pointer transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-400 hover:bg-gray-500 text-gray-900"
                }`}
              >
                + Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse transition-all duration-300">
                <thead>
                  <tr
                    className={`transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-400 text-gray-900"
                    }`}
                  >
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Category</th>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((txn, index) => (
                    <tr
                      key={txn.id}
                      className={`border-b transition-all duration-300 ${
                        isDarkMode
                          ? `border-gray-700 ${
                              index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                            } hover:bg-gray-700`
                          : `border-gray-300 ${
                              index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
                            } hover:bg-gray-300`
                      }`}
                    >
                      {/* Description Column with Tooltip */}
                      <td
                        className={`p-3 text-left truncate max-w-[200px] overflow-hidden ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <span title={txn.description}>
                          {txn.description.length > 30
                            ? txn.description.slice(0, 15) + "..."
                            : txn.description}
                        </span>
                      </td>

                      {/* Amount Column with Dynamic Color */}
                      <td
                        className={`py-2 px-4 font-semibold ${
                          txn.type === "expense"
                            ? isDarkMode
                              ? "text-red-400"
                              : "text-red-600"
                            : isDarkMode
                            ? "text-green-400"
                            : "text-green-600"
                        }`}
                      >
                        ₹{txn.amount}
                      </td>

                      {/* Category & Date Columns */}
                      <td
                        className={`py-2 px-4 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {txn.category}
                      </td>
                      <td
                        className={`py-2 px-4 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {txn.date}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2 px-4 flex space-x-3 justify-center">
                        <button
                          onClick={() => openViewModal(txn)}
                          className={`cursor-pointer transition-all duration-300 ${
                            isDarkMode
                              ? "text-blue-400 hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-500"
                          }`}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openModal(txn)}
                          className={`cursor-pointer transition-all duration-300 ${
                            isDarkMode
                              ? "text-yellow-400 hover:text-yellow-300"
                              : "text-yellow-600 hover:text-yellow-500"
                          }`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmationModal(txn)}
                          className={`cursor-pointer transition-all duration-300 ${
                            isDarkMode
                              ? "text-red-400 hover:text-red-300"
                              : "text-red-600 hover:text-red-500"
                          }`}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <TransactionForm
            isOpen={isOpen}
            closeModal={closeModal}
            fetchTransactions={fetchUserTransactions}
            transaction={editingTransaction}
          />

          {/* Rows per page dropdown */}
          <div className="flex justify-end mt-4">
            <label
              htmlFor="rows-per-page"
              className={`mr-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              Rows per page:
            </label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className={`px-3 py-1 rounded-md transition-all duration-300 cursor-pointer ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-200"
              }`}
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
              className={`px-4 py-2 rounded-md transition-all duration-300 cursor-pointer ${
                isDarkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
            >
              Previous
            </button>

            <div className={isDarkMode ? "text-gray-300" : "text-gray-800"}>
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              className={`px-4 py-2 rounded-md transition-all duration-300 cursor-pointer ${
                isDarkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
            >
              Next
            </button>
          </div>
        </div>
        
        {/* View Transaction Modal */}
        <Transition appear show={viewModalOpen} as="div">
          <Dialog
            as="div"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            open={viewModalOpen}
            onClose={closeViewModal}
          >
            <div
              className={`p-6 rounded-lg shadow-lg w-96 ${
                isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
              }`}
            >
              <Dialog.Title className="text-lg font-bold mb-4">
                Transaction Details
              </Dialog.Title>
              {viewTransaction && (
                <div
                  className={`space-y-5 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <p>
                    <strong>Description:</strong> {viewTransaction.description}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{viewTransaction.amount}
                  </p>
                  <p>
                    <strong>Type:</strong> {viewTransaction.type}
                  </p>
                  <p>
                    <strong>Category:</strong> {viewTransaction.category}
                  </p>
                  <p>
                    <strong>Date:</strong> {viewTransaction.date}
                  </p>
                </div>
              )}
              <div className="mt-4 text-right">
                <button
                  onClick={closeViewModal}
                  className={`px-4 py-2 rounded hover:opacity-80 cursor-pointer ${
                    isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog>
        </Transition>



         {/* Delete Confirmation Modal */}
                <Transition appear show={deleteConfirmationOpen} as="div">
                  <Dialog
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    open={deleteConfirmationOpen}
                     onClose={closeDeleteConfirmationModal}
                  >
                    <div
                      className={`p-6 rounded-lg shadow-lg w-full sm:w-96 ${
                        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
                      }`}
                    >
                      <Dialog.Title className="text-lg font-bold mb-4">
                        Are you sure you want to delete this item?
                      </Dialog.Title>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={closeDeleteConfirmationModal}
                          className={`px-4 py-2 rounded hover:opacity-80 cursor-pointer ${
                            isDarkMode
                              ? "bg-gray-700 text-white"
                              : "bg-gray-300 text-black"
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          
                          onClick={() => {
                            if (transactionToDelete) {
                              handleDelete(transactionToDelete.id);
                            }
                            closeDeleteConfirmationModal();
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Dialog>
                </Transition>
      </div>
    </div>
  );
}