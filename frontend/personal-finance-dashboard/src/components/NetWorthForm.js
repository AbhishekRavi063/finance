import { useNetWorthStore } from "../app/store/netWorthStore"; // Import Zustand store
import { Dialog } from "@headlessui/react"; // Ensure this line is present
import useStore from "../app/store/useStore"; // Import Zustand theme store

export default function NetWorthForm({
  editingItem,
  itemType,
  errors,
  handleSave,
  setEditingItem,
}) {
  const { setModalOpen } = useNetWorthStore(); // ✅ Get modal control from Zustand
  const { isDarkMode } = useStore(); // ✅ Get theme state from Zustand

  function handleCancel() {
    setEditingItem(null); // Reset form data
    setModalOpen(false); // ✅ Close modal
  }

  return (
    <div
      className={`p-6 rounded-lg shadow-lg w-full sm:w-96 transition-all duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <Dialog.Title className="text-lg font-bold mb-4">
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
        className={`w-full p-2 mb-4 border rounded transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-300 text-black"
        }`}
      />
      {errors.description && (
        <p className="text-red-500 text-sm">{errors.description}</p>
      )}

      <input
        type="number"
        placeholder="Amount"
        value={editingItem?.[itemType === "asset" ? "value" : "amount"] ?? ""}
        onChange={(e) => {
          const newValue = e.target.value === "" ? "" : Number(e.target.value);
          setEditingItem({
            ...editingItem,
            [itemType === "asset" ? "value" : "amount"]: newValue,
          });
        }}
        className={`w-full p-2 mb-4 border rounded transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-300 text-black"
        }`}
      />
      {errors.amount && (
        <p className="text-red-500 text-sm">{errors.amount}</p>
      )}

      <div className="flex justify-end space-x-2">
        <button
          onClick={handleCancel} // ✅ Close the modal
          className={`px-4 py-2 rounded hover:bg-opacity-80 transition-all duration-300 cursor-pointer  ${
            isDarkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded hover:bg-opacity-80 transition-all duration-300 cursor-pointer ${
            isDarkMode ? "bg-green-600 text-white" : "bg-green-500 text-black"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
}
