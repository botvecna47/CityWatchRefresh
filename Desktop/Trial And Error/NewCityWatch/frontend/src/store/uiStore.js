import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Sidebar state
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  // Modal state
  modal: null,
  openModal: (modalName, props = {}) => set({ modal: { name: modalName, props } }),
  closeModal: () => set({ modal: null }),

  // Loading overlay
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  // Filters for issues
  filters: {
    city: null,
    ward: null,
    category: null,
    status: null,
    sortBy: 'createdAt',
    order: 'desc',
  },
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  resetFilters: () => set({
    filters: {
      city: null,
      ward: null,
      category: null,
      status: null,
      sortBy: 'createdAt',
      order: 'desc',
    },
  }),
}));
