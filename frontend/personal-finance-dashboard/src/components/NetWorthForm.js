import { useState } from "react";

export default function AddAssetLiabilityForm({ type, onClose }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [isFormValid, setIsFormValid] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !value || isNaN(value)) {
      setIsFormValid(false);
      return;
    }

    // API request to add asset/liability
    try {
      const response = await fetch(`${API_URL}/api/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          value: parseFloat(value),
          category,
        }),
      });

      if (response.ok) {
        // Close form after successful submission
        onClose();
      } else {
        console.error("Error adding asset/liability");
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-gray-800 p-8 rounded-md max-w-lg w-full">
        <h2 className="text-2xl font-semibold mb-4">Add {type === "assets" ? "Asset" : "Liability"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="value" className="block text-sm font-medium text-gray-300">
              Value (₹)
            </label>
            <input
              type="number"
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            />
          </div>

          {!isFormValid && (
            <p className="text-red-500 text-sm mb-4">Please fill in all fields correctly.</p>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Add {type === "assets" ? "Asset" : "Liability"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
