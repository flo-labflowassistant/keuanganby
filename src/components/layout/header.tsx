"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { useUIStore } from "@/stores/ui-store";
import { getMonthName } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    "/": { title: "Beranda", subtitle: "Ringkasan keuangan bulan ini" },
    "/budget": { title: "Pengaturan Anggaran", subtitle: "Kelola anggaran bulanan" },
    "/transactions": { title: "Pencatatan Transaksi", subtitle: "Lacak pengeluaran harian" },
    "/savings": { title: "Tabungan & Target", subtitle: "Kelola target tabungan" },
    "/reports": { title: "Laporan Keuangan", subtitle: "Analisis dan visualisasi" },
    "/reminders": { title: "Pengingat", subtitle: "Kelola pengingat tagihan" },
    "/settings": { title: "Pengaturan", subtitle: "Profil dan preferensi" },
};

export function Header() {
    const pathname = usePathname();
    const { currentMonth, currentYear, prevMonth, nextMonth, toggleMobileSidebar } = useUIStore();

    const pageInfo = PAGE_TITLES[pathname] || { title: "Halaman", subtitle: "" };

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-6 lg:px-8">
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={toggleMobileSidebar}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka menu</span>
            </Button>

            {/* Page Title */}
            <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-foreground truncate">
                    {pageInfo.title}
                </h1>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                    {pageInfo.subtitle}
                </p>
            </div>

            {/* Month Navigator */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-foreground min-w-[130px] text-center">
                    {getMonthName(currentMonth)} {currentYear}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <AddTransactionDialog>
                    <Button size="sm" className="hidden sm:flex gap-1.5">
                        <Plus className="h-4 w-4" />
                        <span className="hidden md:inline">Tambah Cepat</span>
                    </Button>
                </AddTransactionDialog>

                <AddTransactionDialog>
                    <Button size="sm" className="sm:hidden" variant="default">
                        <Plus className="h-4 w-4" />
                    </Button>
                </AddTransactionDialog>

                <Button variant="ghost" size="icon" className="relative h-9 w-9" asChild>
                    <Link href="/reminders">
                        <Bell className="h-[18px] w-[18px]" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                        <span className="sr-only">Notifikasi</span>
                    </Link>
                </Button>


            </div>
        </header>
    );
}
