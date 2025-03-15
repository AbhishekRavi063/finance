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

  setUser: (user) => set({ user }),
  setAssets: (assets) => set({ assets }),
  setLiabilities: (liabilities) => set({ liabilities }),
  setModalOpen: (isOpen) => set({ modalOpen: isOpen }),
  setEditingItem: (item) => set({ editingItem: item }),
  setItemType: (type) => set({ itemType: type }),
  setDeleteModalOpen: (isOpen) => set({ isDeleteModalOpen: isOpen }),
  setItemToDelete: (item) => set({ itemToDelete: item }),
}));
