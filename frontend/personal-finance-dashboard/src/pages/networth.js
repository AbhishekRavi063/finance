import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import Sidebar from "@/components/Sidebar";
import { auth } from "../../lib/firebase";
import { Dialog, Transition } from "@headlessui/react";
import { FaTrash, FaEdit, FaPlus, FaSearch, FaEye } from "react-icons/fa";
import { fetchAssets, fetchLiabilities, deleteItem, saveItem } from "../app/utils/assetsandliabilitiesapi";
import { useNetWorthStore } from "../app/store/netWorthStore"; // Import Zustand store
import NetWorthForm from "@/components/NetWorthForm"; // Import the new form component


export default function NetWorth() {
  const {
    assets,
    liabilities,
    user,
    modalOpen,
    editingItem,
    itemType,
    isDeleteModalOpen,
    itemToDelete,
    searchQuery,
    setSearchQuery,
    setUser,
    setAssets,
    setLiabilities,
    setModalOpen,
    setEditingItem,
    setItemType,
    setDeleteModalOpen,
    setItemToDelete,
    setViewItem, // For view modal
    viewItem, // To store the item to view
    viewModalOpen,
   setViewModalOpen,
  } = useNetWorthStore();

  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        setAssets(await fetchAssets(user.uid));
        setLiabilities(await fetchLiabilities(user.uid));
      }
    });
    return () => unsubscribe();
  }, [setUser, setAssets, setLiabilities]);

  async function handleDelete() {
    if (itemToDelete) {
      const { id, type } = itemToDelete;
      if (await deleteItem(user.uid, id, type)) {
        type === "asset"
          ? setAssets(await fetchAssets(user.uid))
          : setLiabilities(await fetchLiabilities(user.uid));
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }

  function openDeleteModal(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }

  // Save item logic with validation
  async function handleSave() {
    const newErrors = {};

    if (!editingItem?.description) {
      newErrors.description = "Description is required";
    }
    if (!editingItem?.[itemType === "asset" ? "value" : "amount"]) {
      newErrors.amount = "Amount is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (user) {
        const result = await saveItem(user.uid, editingItem, itemType);
        if (result) {
          closeModal();
          itemType === "asset"
            ? setAssets(await fetchAssets(user.uid))
            : setLiabilities(await fetchLiabilities(user.uid));
        }
      }
    }
  }

  function openModal(type, item = null) {
    setEditingItem(item || { description: "", value: "", amount: "" });
    setItemType(type);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingItem(null);
  }

  // View Item Modal functionality
  function openViewModal(item) {
    setViewModalOpen(true);
    setViewItem(item);  // Set the item to display in the view modal
  }

  function closeViewModal() {
    setViewModalOpen(false);
    setViewItem(null);  // Clear the selected item
  }
  // The View Modal functions
function openViewModal(item) {
  setViewModalOpen(true);
  setViewItem(item);  // Set the item to display in the view modal
}

function closeViewModal() {
  setViewModalOpen(false);
  setViewItem(null);  // Clear the selected item
}

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Filtered assets and liabilities based on the search query
  const filteredAssets = assets.filter(asset =>
    asset.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLiabilities = liabilities.filter(liability =>
    liability.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalItems = [...filteredAssets, ...filteredLiabilities];
  const totalPages = Math.ceil(totalItems.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = totalItems.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="flex flex-col lg:flex-row mt-10">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold">Net Worth</h1>
        <p className="text-gray-400">Track your assets and liabilities</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <StatCard
            title="Total Assets"
            amount={`₹${totalAssets.toLocaleString()}`}
            color="text-green-500"
          />
          <StatCard
            title="Total Liabilities"
            amount={`₹${totalLiabilities.toLocaleString()}`}
            color="text-red-500"
          />
          <StatCard
            title="Net Worth"
            amount={`₹${netWorth.toLocaleString()}`}
            color="text-blue-500"
          />
        </div>

        <div className="mt-6 p-6 bg-gray-800 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              <button
                onClick={() => openModal("asset")}
                className="bg-green-600 px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 flex items-center gap-2"
              >
                <FaPlus /> Add Asset
              </button>
              <button
                onClick={() => openModal("liability")}
                className="bg-red-600 px-4 py-2 cursor-pointer rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <FaPlus /> Add Liability
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 p-2 rounded-md text-white"
              />
            </div>
          </div>

          <h3 className="text-gray-400 font-semibold text-lg mt-6">
            Breakdown
          </h3>

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
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-gray-700 border-b border-gray-800"
                  >
                    <td className="p-3 text-left">
                      {item.type === "asset" ? "Asset" : "Liability"}
                    </td>
                    <td className="p-3 text-left">
                      {item.description.length > 30
                        ? item.description.slice(0, 15) + "..."
                        : item.description}
                    </td>

                    <td
                      className={`p-3 text-left ${
                        item.type === "asset"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      ₹{item.value || item.amount}
                    </td>
                    <td className="p-3 flex justify-center space-x-3">

                    <button
                        onClick={() => openViewModal(item)}
                        className="text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        <FaEye />
                      </button>

                      <button
                        onClick={() => openModal(item.type, item)}
                        className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rows per page dropdown */}
          <div className="flex justify-end mt-4">
            <label htmlFor="rows-per-page" className="text-white mr-2">
              Rows per page:
            </label>
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
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Next
            </button>
          </div>
        </div>

        {/* View Item Modal */}
        <Transition appear show={viewModalOpen} as="div">
          <Dialog
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            open={viewModalOpen}
            onClose={closeViewModal}
          >
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full sm:w-96">
              <Dialog.Title className="text-lg font-bold text-white mb-4 ">
                {viewItem ? viewItem.description : "View Item"}
              </Dialog.Title>
              <div className="text-white mb-4 space-y-5">
                <p>
                  <strong>Type:</strong> {viewItem?.type === "asset" ? "Asset" : "Liability"}
                </p>
                <p>
                  <strong>Description:</strong> {viewItem?.description}
                </p>
                <p>
                  <strong>Value/Amount:</strong> ${viewItem?.value || viewItem?.amount}
                </p>
              </div>
              <button
                onClick={closeViewModal}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Confirmation Modal */}
        <Transition appear show={isDeleteModalOpen} as="div">
          <Dialog
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            open={isDeleteModalOpen}
            onClose={closeDeleteModal}
          >
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full sm:w-96">
              <Dialog.Title className="text-lg font-bold text-white mb-4">
                Are you sure you want to delete this item?
              </Dialog.Title>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </Dialog>
        </Transition>
      </main>
    </div>
  );
}
