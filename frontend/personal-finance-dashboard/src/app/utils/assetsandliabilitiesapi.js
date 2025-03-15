const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchAssets(userId) {
  if (!userId) return [];
  try {
    const response = await fetch(`${API_URL}/api/assets?firebase_uid=${userId}`);
    const data = await response.json();
    if (response.ok) return data;
    console.error("Error fetching assets:", data.error);
    return [];
  } catch (error) {
    console.error("Network error:", error);
    return [];
  }
}

export async function fetchLiabilities(userId) {
  if (!userId) return [];
  try {
    const response = await fetch(`${API_URL}/api/liabilities?firebase_uid=${userId}`);
    const data = await response.json();
    if (response.ok) return data;
    console.error("Error fetching liabilities:", data.error);
    return [];
  } catch (error) {
    console.error("Network error:", error);
    return [];
  }
}

export async function deleteItem(userId, id, type) {
  if (!userId) return;
  
  const endpoint = type === "liability" ? "liabilities" : "assets";

  try {
    const response = await fetch(`${API_URL}/api/${endpoint}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_uid: userId }),
    });

    const textResponse = await response.text();
    console.log("Raw API Response:", textResponse);

    if (!response.ok) {
      throw new Error(`Failed to delete: ${textResponse}`);
    }

    return true; // Indicating success
  } catch (error) {
    console.error("Network error:", error);
    return false;
  }
}

export async function saveItem(userId, item, type) {
  if (!userId) return;

  const url = item?.id
    ? `${API_URL}/api/${type === "asset" ? "assets" : "liabilities"}/${item.id}`
    : `${API_URL}/api/${type === "asset" ? "assets" : "liabilities"}`;

  const method = item?.id ? "PUT" : "POST";

  const payload = {
    firebase_uid: userId,
    description: item.description,
    type,
    [type === "asset" ? "value" : "amount"]: Number(item.value || item.amount || 0),
  };

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("API Response Status:", response.status);
    const textResponse = await response.text();
    console.log("Raw API Response:", textResponse);

    if (!response.ok) {
      throw new Error("Failed to save: " + textResponse);
    }

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}
