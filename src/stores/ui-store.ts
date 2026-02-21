import { create } from "zustand";

interface UIState {
    sidebarOpen: boolean;
    mobileSidebarOpen: boolean;
    currentMonth: number;
    currentYear: number;
    toggleSidebar: () => void;
    toggleMobileSidebar: () => void;
    setMonthYear: (month: number, year: number) => void;
    nextMonth: () => void;
    prevMonth: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    mobileSidebarOpen: false,
    currentMonth: 2,
    currentYear: 2026,

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),

    setMonthYear: (month, year) => set({ currentMonth: month, currentYear: year }),

    nextMonth: () =>
        set((s) => {
            if (s.currentMonth === 12) return { currentMonth: 1, currentYear: s.currentYear + 1 };
            return { currentMonth: s.currentMonth + 1 };
        }),

    prevMonth: () =>
        set((s) => {
            if (s.currentMonth === 1) return { currentMonth: 12, currentYear: s.currentYear - 1 };
            return { currentMonth: s.currentMonth - 1 };
        }),
}));
