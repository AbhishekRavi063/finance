// lib/store.js
import {create} from 'zustand';

const useStore = create((set) => ({
  user: null,
  assets: [],
  liabilities: [],
  transactions: [],
  selectedMonth: "All",
  selectedCategory: "All",
  setUser: (user) => set({ user }),
  setAssets: (assets) => set({ assets }),
  setLiabilities: (liabilities) => set({ liabilities }),
  setTransactions: (transactions) => set({ transactions }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));

export default useStore;
