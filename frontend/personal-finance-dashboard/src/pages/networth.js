import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import Sidebar from "@/components/Sidebar";
import { auth } from "../../lib/firebase";
import { Dialog, Transition } from "@headlessui/react";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import { fetchAssets, fetchLiabilities, deleteItem, saveItem } from "../app/utils/assetsandliabilitiesapi"; 
import { useNetWorthStore } from "../app/store/netWorthStore"; // Import Zustand store

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    setUser,
    setAssets,
    setLiabilities,
    setModalOpen,
    setEditingItem,
    setItemType,
    setDeleteModalOpen,
    setItemToDelete,
  } = useNetWorthStore();

  const [errors, setErrors] = useState({});

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

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold">Net Worth</h1>
        <p className="text-gray-400">Track your assets and liabilities</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
          
          <h3 className="text-gray-400 font-semibold text-lg mt-6">Breakdown</h3>

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
        </div>

        {/* Add/Edit Modal */}
        <Transition appear show={modalOpen} as="div">
          <Dialog
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            open={modalOpen}
            onClose={closeModal}
          >
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full sm:w-96">
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
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}

              <input
                type="number"
                placeholder="Amount"
                value={editingItem?.[itemType === "asset" ? "value" : "amount"] ?? ""}
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
              {errors.amount && (
                <p className="text-red-500 text-sm">{errors.amount}</p>
              )}

              {/* Button Container */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
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
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
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
