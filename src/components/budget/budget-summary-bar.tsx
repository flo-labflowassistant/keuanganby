"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { useCategories, useMonthlyBudgets } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";

export function BudgetSummaryBar() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: categories = [], isLoading: loadingCats } = useCategories();
    const { data: monthlyBudgets = [], isLoading: loadingBudgets } = useMonthlyBudgets(currentMonth, currentYear);
    const isLoading = loadingCats || loadingBudgets;
    // Also fetch transactions to get actual income if we want, but for budget planning we use categories budget_allocation

    // Helper to get budget for a category
    const getBudget = (categoryId: string) => monthlyBudgets.find(b => b.categoryId === categoryId)?.amount || 0;

    const totalIncome = categories.filter(c => c.mainCategory === 'Income').reduce((sum, c) => sum + getBudget(c.id), 0);
    const totalSavings = categories.filter(c => c.mainCategory === 'Savings').reduce((sum, c) => sum + getBudget(c.id), 0);
    const totalAllocated = categories.filter(c => c.mainCategory === 'Needs' || c.mainCategory === 'Wants').reduce((sum, c) => sum + getBudget(c.id), 0);
    const remaining = totalIncome - totalAllocated - totalSavings;

    const cards = [
        {
            label: "Total Pemasukan",
            amount: totalIncome,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            emoji: "💰",
        },
        {
            label: "Teralokasi",
            amount: totalAllocated,
            color: "text-primary",
            bg: "bg-primary/10",
            emoji: "📋",
        },
        {
            label: "Sisa",
            amount: remaining,
            color: remaining >= 0 ? "text-emerald-600" : "text-destructive",
            bg: remaining >= 0 ? "bg-emerald-50" : "bg-red-50",
            emoji: remaining >= 0 ? "✅" : "⚠️",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {isLoading ? (
                <div className="col-span-3 text-center py-4 text-sm text-muted-foreground">Memuat data ringkasan...</div>
            ) : cards.map((card) => (
                <div
                    key={card.label}
                    className={cn(
                        "rounded-2xl border border-primary/10 bg-white p-4 flex items-center gap-3"
                    )}
                >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-base", card.bg)}>
                        {card.emoji}
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {card.label}
                        </p>
                        <p className={cn("text-lg font-bold font-currency", card.color)}>
                            {formatCurrency(card.amount)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
