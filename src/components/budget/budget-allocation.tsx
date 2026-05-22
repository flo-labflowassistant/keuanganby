"use client";

import { cn, formatCurrency } from "@/lib/utils";
import type { MainCategory } from "@/types";
import { useCategories, useTransactions } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import { Loader2 } from "lucide-react";

function getMainCategoryStyle(mc: MainCategory) {
    switch (mc) {
        case "Needs": return { label: "Kebutuhan", emoji: "🏠", barColor: "bg-primary", pillBg: "bg-primary/10", pillText: "text-primary" };
        case "Wants": return { label: "Keinginan", emoji: "✨", barColor: "bg-fuchsia-500", pillBg: "bg-fuchsia-50", pillText: "text-fuchsia-600" };
        case "Savings": return { label: "Tabungan & Transfer", emoji: "🐷", barColor: "bg-blue-500", pillBg: "bg-blue-50", pillText: "text-blue-600" };
        case "Income": return { label: "Pemasukan", emoji: "💰", barColor: "bg-emerald-500", pillBg: "bg-emerald-50", pillText: "text-emerald-600" };
    }
    return { label: "", emoji: "", barColor: "", pillBg: "", pillText: "" };
}

export function BudgetAllocation() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: categories = [], isLoading: loadingCats } = useCategories();
    const { data: transactions = [], isLoading: loadingTxns } = useTransactions(currentMonth, currentYear, "Kartu Utama");

    const totalTerpakai = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const enrichedCategories = categories.map((c) => {
        const spent = transactions
            .filter((t) => t.categoryId === c.id && t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const percentage = totalTerpakai > 0 ? Math.round((spent / totalTerpakai) * 100) : 0;

        return {
            id: c.id,
            category: c,
            spent,
            percentage
        };
    });

    const grouped: Record<string, typeof enrichedCategories> = {
        Needs: [],
        Wants: [],
        Savings: [],
        Income: [],
    };

    for (const b of enrichedCategories) {
        if (grouped[b.category.mainCategory]) {
            grouped[b.category.mainCategory].push(b);
        }
    }

    if (loadingCats || loadingTxns) {
        return (
            <div className="rounded-2xl border border-primary/10 bg-white p-10 flex justify-center items-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Ringkasan Pengeluaran per Kategori</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Pantau pengeluaran aktual bulan ini</p>
                </div>
            </div>

            <div className="space-y-6">
                {(["Needs", "Wants", "Savings"] as MainCategory[]).map((mc) => {
                    const style = getMainCategoryStyle(mc);
                    const allItems = grouped[mc];
                    if (allItems.length === 0) return null;

                    const totalSpent = allItems.reduce((s, i) => s + i.spent, 0);
                    const groupPercentage = totalTerpakai > 0 ? Math.round((totalSpent / totalTerpakai) * 100) : 0;

                    return (
                        <div key={mc}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm">{style.emoji}</span>
                                <span className={cn("text-xs font-semibold uppercase tracking-wider", style.pillText)}>
                                    {style.label}
                                </span>
                                <span className={cn("text-[10px] font-medium rounded-full px-2 py-0.5 ml-auto", style.pillBg, style.pillText)}>
                                    {groupPercentage}% ({formatCurrency(totalSpent)})
                                </span>
                            </div>

                            <div className="space-y-4">
                                {allItems.map((item) => {
                                    return (
                                        <div key={item.id} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-foreground">
                                                    {item.category?.name}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-currency font-medium text-foreground">
                                                        {formatCurrency(item.spent)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        style.barColor
                                                    )}
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {item.percentage}% dari total pengeluaran
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
