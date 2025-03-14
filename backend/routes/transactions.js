const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 🟢 GET All Transactions
router.get("/", async (req, res) => {
    const { firebase_uid } = req.query;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // ✅ Step 1: Fetch the user ID from the "users" table
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // ✅ Step 2: Fetch transactions for the user
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user_id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

router.post("/", async (req, res) => {
    const { type, amount, category, description, date, firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    console.log("Received Firebase UID:", firebase_uid);

    // ✅ Step 1: Fetch the user ID from the "users" table
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError) {
        console.error("Error fetching user from users table:", userError.message);
        return res.status(500).json({ error: "Database error while fetching user" });
    }

    let user_id;

    // ✅ Step 2: If user is not found, insert a new user
    if (!userData) {
        console.log("User not found. Creating new user...");
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{ firebase_uid }])
            .select("id")
            .single();

        if (insertError) {
            console.error("Error inserting new user:", insertError.message);
            return res.status(500).json({ error: "Failed to create user" });
        }

        user_id = newUser.id;
        console.log("New user created with ID:", user_id);
    } else {
        user_id = userData.id;
        console.log("User found with ID:", user_id);
    }

    // ✅ Step 3: Normalize transaction type
    const normalizedType = type.toLowerCase();

    if (!["income", "expense"].includes(normalizedType)) {
        return res.status(400).json({ error: "Invalid type. Allowed values: 'income', 'expense'" });
    }

    // ✅ Step 4: Ensure date format is correct
    const formattedDate = new Date(date).toISOString();

    // ✅ Step 5: Insert transaction into "transactions" table
    const { data, error } = await supabase
        .from("transactions")
        .insert([{ user_id, type: normalizedType, amount, category, description, date: formattedDate }])
        .select();

    if (error) {
        console.error("Error inserting transaction:", error.message);
        return res.status(500).json({ error: error.message });
    }

    console.log("Transaction inserted successfully:", data);

    res.status(201).json({ message: "Transaction added successfully", transaction: data[0] });
});


// 🟢 GET Single Transaction (Only if it belongs to the user)
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { firebase_uid } = req.query;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // ✅ Step 1: Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // ✅ Step 2: Fetch transaction only if it belongs to the user
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user_id)
        .maybeSingle();

    if (error || !data) {
        return res.status(404).json({ error: "Transaction not found or unauthorized" });
    }

    res.json(data);
});


// 🟡 UPDATE Transaction (Only if it belongs to the user)
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { type, amount, category, description, date, firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // ✅ Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // ✅ Ensure transaction belongs to the user
    const { data: existingTransaction } = await supabase
        .from("transactions")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();

    if (!existingTransaction || existingTransaction.user_id !== user_id) {
        return res.status(403).json({ error: "Unauthorized to update this transaction" });
    }

    // ✅ Update transaction
    const { data, error } = await supabase
        .from("transactions")
        .update({ type, amount, category, description, date })
        .eq("id", id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Transaction updated successfully", transaction: data[0] });
});

// 🔴 DELETE Transaction (Only if it belongs to the user)
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // ✅ Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // ✅ Ensure transaction belongs to the user
    const { data: existingTransaction } = await supabase
        .from("transactions")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();

    if (!existingTransaction || existingTransaction.user_id !== user_id) {
        return res.status(403).json({ error: "Unauthorized to delete this transaction" });
    }

    // ✅ Delete transaction
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Transaction deleted successfully" });
});
module.exports = router;
