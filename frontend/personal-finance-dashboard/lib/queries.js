import { supabase } from './supabaseClient';

// Fetch all transactions
export const fetchTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

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
