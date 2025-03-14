import { useState } from "react";
import { auth } from "../lib/firebase";

export default function AddTransaction({ refreshTransactions }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to add a transaction.");

    const transactionData = {
      type: "expense",
      amount: parseFloat(amount),
      category: "Other",
      description,
      date: new Date().toISOString(),
      firebase_uid: user.uid, // 🔹 Send Firebase UID
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (!res.ok) throw new Error("Failed to add transaction");

      setAmount("");
      setDescription("");
      refreshTransactions();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
      <button type="submit">Add Transaction</button>
    </form>
  );
}
