import { supabase } from './supabaseClient';

// Fetch total assets & liabilities for net worth calculation
export const fetchNetWorth = async (userId) => {
  const { data, error } = await supabase
    .from('net_worth')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchTransactions = async (userId) => {
  const { data, error } = await supabase
    .from("transactions") // Ensure this table name is correct
    .select("*")
    .eq("user_id", userId); // Make sure the field name is correct
  if (error) {
    console.error("❌ Error fetching transactions:", error);
    throw error;
  }
  return data;
};

