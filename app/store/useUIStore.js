import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUIStore = create(
    persist(
        (set) => ({
            isSidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
            setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
        }),
        {
            name: "ui-storage",
        }
    )
);

export default useUIStore;
