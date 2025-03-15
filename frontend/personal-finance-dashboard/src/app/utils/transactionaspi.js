const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function fetchTransactions(userId, API_URL) {
    if (!userId) return [];
    try {
      const response = await fetch(`${API_URL}/api/transactions?firebase_uid=${userId}`);
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        console.error("Error fetching transactions:", data.error);
        return [];
      }
    } catch (error) {
      console.error("Network error:", error);
      return [];
    }
  }
  
  export async function deleteTransaction(transactionId, userId, API_URL) {
    if (!userId) {
      console.error("User is not authenticated.");
      return false;
    }
    try {
      const response = await fetch(`${API_URL}/api/transactions/${transactionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firebase_uid: userId }), // Pass the firebase_uid
      });
  
      if (response.ok) {
        return true;
      } else {
        const data = await response.json();
        console.error("Error deleting transaction:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Network error:", error);
      return false;
    }
  }
  