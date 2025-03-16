// lib/store.js
import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  assets: [],
  liabilities: [],
  transactions: [],
  selectedMonth: "All",
  selectedCategory: "All",
  isDarkMode: false,  // Add isDarkMode state
  setUser: (user) => set({ user }),
  setAssets: (assets) => set({ assets }),
  setLiabilities: (liabilities) => set({ liabilities }),
  setTransactions: (transactions) => set({ transactions }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),  // Add toggle function for dark mode
  setDarkMode: (mode) => set({ isDarkMode: mode }),
}));

export default useStore;
