import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useAuthStore = create((set, get) => ({
  user: null,
  authLoading: true,
  setUser: (userData) => set({ user: userData, authLoading: false }),
  clearUser: () => set({ user: null, authLoading: false }),
  logout: () => set({ user: null, authLoading: false }),
  isLoggedIn: () => !!get().user,

  // New: Async refetch user from API
  refetchUser: async () => {
    try {
      const { data } = await axios.get("/api/auth/getUser");
      if (data?.user) {
        get().setUser(data.user);
        return data.user;
      }
    } catch (error) {
      console.error("Failed to refetch user:", error);
      get().clearUser();
      // Optionally logout on auth error
    }
    return null;
  },
}));

export default useAuthStore;

