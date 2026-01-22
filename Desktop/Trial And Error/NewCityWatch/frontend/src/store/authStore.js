import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set, get) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isLoggedIn(),
  isLoading: false,
  error: null,

  // Login
  login: async (phone, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(phone, password);
      set({
        user: response.data?.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Logout
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  // Update user in store
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
