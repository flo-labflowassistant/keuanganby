import type { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
    { label: "Beranda", icon: "LayoutDashboard", href: "/" },
    { label: "Anggaran", icon: "Wallet", href: "/budget" },
    { label: "Transaksi", icon: "ArrowLeftRight", href: "/transactions" },
    { label: "Tabungan & Target", icon: "PiggyBank", href: "/savings" },
    { label: "Laporan", icon: "BarChart3", href: "/reports" },
    { label: "Pengingat", icon: "Bell", href: "/reminders" },
    { label: "Pengaturan", icon: "Settings", href: "/settings" },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
    { label: "Beranda", icon: "LayoutDashboard", href: "/" },
    { label: "Anggaran", icon: "Wallet", href: "/budget" },
    { label: "Transaksi", icon: "ArrowLeftRight", href: "/transactions" },
    { label: "Laporan", icon: "BarChart3", href: "/reports" },
];

export const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const DEFAULT_ACCOUNTS = [
    "Bank Mandiri",
    "BCA",
    "Cash",
    "Credit Card",
    "GoPay",
    "OVO",
];

export const MAIN_CATEGORIES = ["Needs", "Wants", "Savings"] as const;

export const CATEGORY_ICONS: Record<string, string> = {
    "Housing & Utilities": "Home",
    "Groceries": "ShoppingCart",
    "Transportation": "Car",
    "Internet & Phone": "Wifi",
    "Insurance": "Shield",
    "Entertainment": "Film",
    "Dining Out": "UtensilsCrossed",
    "Shopping": "ShoppingBag",
    "Self Care": "Heart",
    "Subscriptions": "CreditCard",
    "Emergency Fund": "ShieldCheck",
    "Investment": "TrendingUp",
    "General Savings": "PiggyBank",
};

export const CURRENCY_CONFIG = {
    locale: "id-ID",
    currency: "IDR",
    prefix: "Rp",
};
