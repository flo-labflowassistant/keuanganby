"use client";

import { useAccounts, useSavingsOverview } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import { Wallet, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function WalletBalance() {
    const { data: accounts, isLoading } = useAccounts();
    const { currentMonth, currentYear } = useUIStore();
    const { data: savingsOverview } = useSavingsOverview(currentMonth, currentYear);

    const utama = accounts?.find(a => a.name === "Kartu Utama");
    const monthlySavings = savingsOverview?.monthlyInflow || 0;
    const monthlyOutflow = savingsOverview?.monthlyOutflow || 0;
    const savingsBalance = savingsOverview?.balance || 0;

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="h-24 bg-primary/5 animate-pulse rounded-2xl border border-primary/10"></div>
                <div className="h-24 bg-primary/5 animate-pulse rounded-2xl border border-primary/10"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Kartu Utama */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="absolute -right-4 -top-4 opacity-5">
                    <Wallet className="h-24 w-24" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Wallet className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Saldo Utama
                    </span>
                </div>
                <div className="text-xl font-bold text-foreground font-currency">
                    {formatCurrency(utama?.balance || 0)}
                </div>
            </div>

            {/* Kartu Tabungan */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="absolute -right-4 -top-4 opacity-5 text-primary">
                    <PiggyBank className="h-24 w-24" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <PiggyBank className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Saldo Tabungan
                    </span>
                </div>
                <div className="text-xl font-bold text-primary font-currency">
                    {formatCurrency(savingsBalance)}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                    {monthlySavings > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <TrendingUp className="h-3 w-3" />
                            +{formatCurrency(monthlySavings)}
                        </span>
                    )}
                    {monthlyOutflow > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500">
                            <TrendingDown className="h-3 w-3" />
                            -{formatCurrency(monthlyOutflow)}
                        </span>
                    )}
                    {monthlySavings === 0 && monthlyOutflow === 0 && (
                        <span className="text-[11px] font-medium text-emerald-600">
                            Tidak ada mutasi bulan ini
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
