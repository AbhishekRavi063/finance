// store.js
import {create} from "zustand";

export const useNetWorthStore = create((set) => ({
  assets: [],
  liabilities: [],
  user: null,
  modalOpen: false,
  editingItem: null,
  itemType: "", // 'asset' or 'liability'
  isDeleteModalOpen: false,
  itemToDelete: null,
  searchQuery: '',

  setUser: (user) => set({ user }),
  setAssets: (assets) => set({ assets }),
  setLiabilities: (liabilities) => set({ liabilities }),
  setModalOpen: (isOpen) => set({ modalOpen: isOpen }),
  setEditingItem: (item) => set({ editingItem: item }),
  setItemType: (type) => set({ itemType: type }),
  setDeleteModalOpen: (isOpen) => set({ isDeleteModalOpen: isOpen }),
  setItemToDelete: (item) => set({ itemToDelete: item }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  viewModalOpen: false,
  setViewModalOpen: (open) => set({ viewModalOpen: open }),
  viewItem: null,
  setViewItem: (item) => set({ viewItem: item }),
  closeModal: () => set({ modalOpen: false }), // ✅ Add this function

}));
