import { create } from "zustand";
import type { MainCategory } from "@/types";

interface FilterState {
    search: string;
    categoryId: string | null;
    mainCategory: MainCategory | null;
    accountName: string | null;
    page: number;
    pageSize: number;
    setSearch: (search: string) => void;
    setCategoryId: (id: string | null) => void;
    setMainCategory: (mc: MainCategory | null) => void;
    setAccountName: (name: string | null) => void;
    setPage: (page: number) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    search: "",
    categoryId: null,
    mainCategory: null,
    accountName: null,
    page: 1,
    pageSize: 10,

    setSearch: (search) => set({ search, page: 1 }),
    setCategoryId: (categoryId) => set({ categoryId, page: 1 }),
    setMainCategory: (mainCategory) => set({ mainCategory, page: 1 }),
    setAccountName: (accountName) => set({ accountName, page: 1 }),
    setPage: (page) => set({ page }),
    resetFilters: () =>
        set({ search: "", categoryId: null, mainCategory: null, accountName: null, page: 1 }),
}));
