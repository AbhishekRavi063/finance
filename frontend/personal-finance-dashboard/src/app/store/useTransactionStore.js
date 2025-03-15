import { create } from 'zustand';

const useTransactionStore = create((set, get) => ({
  transactions: [],
  categories: ["Food", "Transport", "Entertainment"],
  filteredTransactions: [],
  searchQuery: "", // Add searchQuery to the store
  formData: {
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: "",
  },
  newCategory: "",
  isNewCategoryModalOpen: false,
  isDropdownOpen: false,
  errors: {},
  
  // Actions
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({
    transactions: [...state.transactions, transaction],
  })),
  updateTransaction: (updatedTransaction) => set((state) => ({
    transactions: state.transactions.map((transaction) =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    ),
  })),
  deleteTransaction: (transactionId) => set((state) => ({
    transactions: state.transactions.filter((transaction) => transaction.id !== transactionId),
  })),
  setFilteredTransactions: (filteredTransactions) => set({ filteredTransactions }),

  // Add setSearchQuery function to update searchQuery and filtered transactions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    const filtered = get().transactions.filter((txn) =>
      txn.description.toLowerCase().includes(query.toLowerCase()) ||
      txn.category.toLowerCase().includes(query.toLowerCase())
    );
    set({ filteredTransactions: filtered });
  },

  // Form state management
  setFormData: (data) => set({ formData: { ...data } }),
  setNewCategory: (category) => set({ newCategory: category }),
  setIsNewCategoryModalOpen: (value) => set({ isNewCategoryModalOpen: value }),
  setIsDropdownOpen: (value) => set({ isDropdownOpen: value }),
  setErrors: (errors) => set({ errors }),

  // Category management
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category],
  })),
  handleCategoryChange: (category) => set((state) => {
    if (category === "add_new") {
      state.setIsNewCategoryModalOpen(true);
    } else {
      state.setFormData({ ...state.formData, category });
    }
    state.setIsDropdownOpen(false);
  }),
  handleNewCategorySubmit: () => set((state) => {
    if (state.newCategory.trim() !== "") {
      state.addCategory(state.newCategory);
      state.setFormData({ ...state.formData, category: state.newCategory });
    }
    state.setNewCategory("");
    state.setIsNewCategoryModalOpen(false);
    state.setIsDropdownOpen(false);
  }),

  // Form validation
  validateForm: () => {
    const errors = {};
    const { formData } = get();
    if (!formData.amount) errors.amount = "Amount is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.date) errors.date = "Date is required";
    return errors;
  },
}));

export default useTransactionStore;
