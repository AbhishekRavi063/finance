const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 🟢 GET All Assets
router.get("/assets", async (req, res) => {
    const { firebase_uid } = req.query;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID from the "users" table
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Fetch assets for the user
    const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user_id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

// 🟢 POST Asset (Create)
router.post("/assets", async (req, res) => {
    const { type, value, description, firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID from the "users" table
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Insert asset into "assets" table
    const { data, error } = await supabase
        .from("assets")
        .insert([{ user_id, type, value, description, created_at: new Date().toISOString() }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Asset added successfully", asset: data[0] });
});

// 🟢 GET Single Asset (Only if it belongs to the user)
router.get("/assets/:id", async (req, res) => {
    const { id } = req.params;
    const { firebase_uid } = req.query;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Fetch asset only if it belongs to the user
    const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("id", id)
        .eq("user_id", user_id)
        .maybeSingle();

    if (error || !data) {
        return res.status(404).json({ error: "Asset not found or unauthorized" });
    }

    res.json(data);
});

// 🟡 UPDATE Asset (Only if it belongs to the user)
router.put("/assets/:id", async (req, res) => {
    const { id } = req.params;
    const { type, value, description, firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Ensure asset belongs to the user
    const { data: existingAsset } = await supabase
        .from("assets")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();

    if (!existingAsset || existingAsset.user_id !== user_id) {
        return res.status(403).json({ error: "Unauthorized to update this asset" });
    }

    // Update asset
    const { data, error } = await supabase
        .from("assets")
        .update({ type, value, description })
        .eq("id", id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Asset updated successfully", asset: data[0] });
});

// 🔴 DELETE Asset (Only if it belongs to the user)
router.delete("/assets/:id", async (req, res) => {
    const { id } = req.params;
    const { firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Ensure asset belongs to the user
    const { data: existingAsset } = await supabase
        .from("assets")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();

    if (!existingAsset || existingAsset.user_id !== user_id) {
        return res.status(403).json({ error: "Unauthorized to delete this asset" });
    }

    // Delete asset
    const { error } = await supabase.from("assets").delete().eq("id", id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Asset deleted successfully" });
});

// 🟢 GET All Liabilities
router.get("/liabilities", async (req, res) => {
    const { firebase_uid } = req.query;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID from the "users" table
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Fetch liabilities for the user
    const { data, error } = await supabase
        .from("liabilities")
        .select("*")
        .eq("user_id", user_id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

// 🟢 POST Liability (Create)
router.post("/liabilities", async (req, res) => {
    const { type, amount, description, firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID from the "users" table
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Insert liability into "liabilities" table
    const { data, error } = await supabase
        .from("liabilities")
        .insert([{ user_id, type, amount, description, created_at: new Date().toISOString() }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Liability added successfully", liability: data[0] });
});

// 🟢 GET Single Liability (Only if it belongs to the user)
router.get("/liabilities/:id", async (req, res) => {
    const { id } = req.params;
    const { firebase_uid } = req.query;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Fetch liability only if it belongs to the user
    const { data, error } = await supabase
        .from("liabilities")
        .select("*")
        .eq("id", id)
        .eq("user_id", user_id)
        .maybeSingle();

    if (error || !data) {
        return res.status(404).json({ error: "Liability not found or unauthorized" });
    }

    res.json(data);
});

// 🟡 UPDATE Liability (Only if it belongs to the user)
router.put("/liabilities/:id", async (req, res) => {
    const { id } = req.params;
    const { type, amount, description, firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Ensure liability belongs to the user
    const { data: existingLiability } = await supabase
        .from("liabilities")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();

    if (!existingLiability || existingLiability.user_id !== user_id) {
        return res.status(403).json({ error: "Unauthorized to update this liability" });
    }

    // Update liability
    const { data, error } = await supabase
        .from("liabilities")
        .update({ type, amount, description })
        .eq("id", id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Liability updated successfully", liability: data[0] });
});

// 🔴 DELETE Liability (Only if it belongs to the user)
router.delete("/liabilities/:id", async (req, res) => {
    const { id } = req.params;
    const { firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Firebase UID is required" });
    }

    // Fetch the user ID
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", firebase_uid)
        .maybeSingle();

    if (userError || !userData) {
        return res.status(404).json({ error: "User not found" });
    }

    const user_id = userData.id;

    // Ensure liability belongs to the user
    const { data: existingLiability } = await supabase
        .from("liabilities")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();

    if (!existingLiability || existingLiability.user_id !== user_id) {
        return res.status(403).json({ error: "Unauthorized to delete this liability" });
    }

    // Delete liability
    const { error } = await supabase.from("liabilities").delete().eq("id", id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Liability deleted successfully" });
});

module.exports = router;
