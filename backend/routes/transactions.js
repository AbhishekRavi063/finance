const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 🟢 GET All Transactions
router.get("/", async (req, res) => {
    const { user_id } = req.query; // Filter by user_id if needed

    let query = supabase.from("transactions").select("*");

    if (user_id) {
        query = query.eq("user_id", user_id);
    }

    const { data, error } = await query;

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

    // ✅ Fetch the corresponding user ID from auth.users
    const { data: userData, error: userError } = await supabase
      .from("users") // ✅ Query "users" table, not "auth.users"
      .select("*")
      .eq("firebase_uid", firebase_uid)
      .single();
      
      if (userError) {
        console.error("Error fetching user from users table:", userError);
    } else {
        console.log("User found:", userData);
    }

    const user_id = userData.id;
    console.log("Resolved Supabase User ID:", user_id);

    // ✅ Ensure type is lowercase to match the DB constraint
    const normalizedType = type.toLowerCase();

    // ✅ Validate transaction type
    if (!["income", "expense"].includes(normalizedType)) {
        return res.status(400).json({ error: "Invalid type. Allowed values: 'income', 'expense'" });
    }

    // ✅ Ensure the date is in ISO format
    const formattedDate = new Date(date).toISOString();

    // ✅ Insert transaction into the database
    const { data, error } = await supabase
        .from("transactions")
        .insert([{ user_id, type: normalizedType, amount, category, description, date: formattedDate }])
        .select();

    if (error) {
        console.error("Error inserting transaction:", error);
        return res.status(500).json({ error: error.message });
    }

    console.log("Transaction inserted successfully:", data);

    res.status(201).json({ message: "Transaction added successfully", transaction: data[0] });
});




// 🟢 GET Single Transaction by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(data);
});

// 🟡 UPDATE Transaction
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    const { data, error } = await supabase
        .from("transactions")
        .update({ type, amount, category, description, date })
        .eq("id", id)
        .select(); // ✅ Ensures updated data is returned

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Transaction updated successfully", transaction: data[0] });
});

// 🔴 DELETE Transaction
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Transaction deleted successfully" });
});


module.exports = router;
