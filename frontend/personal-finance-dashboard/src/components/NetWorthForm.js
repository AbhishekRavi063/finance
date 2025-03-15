import { useState } from "react";
import { Dialog } from "@headlessui/react"; // Ensure this line is present

export default function NetWorthForm({
  editingItem,
  itemType,
  errors,
  handleSave,
  setEditingItem,
  closeModal, // Assuming this prop is passed in to close the modal
}) {
  function handleCancel() {
    setEditingItem(null); // Reset the form data
    closeModal(); // Close the modal
  }

  return (
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
          onClick={handleCancel} // Close the modal
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
  );
}
