"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { MainCategory } from "@/types";
import { useCategories, useTransactions, useUpdateCategoryBudget, useMonthlyBudgets } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

function getMainCategoryStyle(mc: MainCategory) {
    switch (mc) {
        case "Needs": return { label: "Kebutuhan", emoji: "🏠", barColor: "bg-primary", pillBg: "bg-primary/10", pillText: "text-primary" };
        case "Wants": return { label: "Keinginan", emoji: "✨", barColor: "bg-fuchsia-500", pillBg: "bg-fuchsia-50", pillText: "text-fuchsia-600" };
        case "Savings": return { label: "Tabungan", emoji: "🐷", barColor: "bg-blue-500", pillBg: "bg-blue-50", pillText: "text-blue-600" };
        case "Income": return { label: "Pemasukan", emoji: "💰", barColor: "bg-emerald-500", pillBg: "bg-emerald-50", pillText: "text-emerald-600" };
    }
    return { label: "", emoji: "", barColor: "", pillBg: "", pillText: "" };
}

export function BudgetAllocation() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: categories = [], isLoading: loadingCats } = useCategories();
    const { data: transactions = [], isLoading: loadingTxns } = useTransactions(currentMonth, currentYear);
    const { data: monthlyBudgets = [], isLoading: loadingBudgets } = useMonthlyBudgets(currentMonth, currentYear);
    const updateBudget = useUpdateCategoryBudget();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    const handleEditClick = (id: string, currentVal: number) => {
        setEditingId(id);
        setEditValue(currentVal.toString());
    };

    const handleSave = async (id: string) => {
        if (!editValue) {
            setEditingId(null);
            return;
        }
        await updateBudget.mutateAsync({ id, allocation: Number(editValue), month: currentMonth, year: currentYear });
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === "Enter") handleSave(id);
        if (e.key === "Escape") setEditingId(null);
    };

    const enrichedBudgets = categories.map((c) => {
        const bg = monthlyBudgets.find(b => b.categoryId === c.id);
        const allocation = bg ? bg.amount : 0;
        const spent = transactions
            .filter((t) => t.categoryId === c.id && t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const percentage = allocation > 0 ? Math.round((spent / allocation) * 100) : 0;

        return {
            id: c.id,
            category: c,
            allocation,
            spent,
            percentage
        };
    });

    const grouped: Record<string, typeof enrichedBudgets> = {
        Needs: [],
        Wants: [],
        Savings: [],
        Income: [],
    };

    for (const b of enrichedBudgets) {
        if (grouped[b.category.mainCategory]) {
            grouped[b.category.mainCategory].push(b);
        }
    }

    if (loadingCats || loadingTxns || loadingBudgets) {
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
                    <h3 className="text-sm font-semibold text-foreground">Alokasi Anggaran</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Per kategori pengeluaran (Klik nominal untuk edit)</p>
                </div>
            </div>

            <div className="space-y-6">
                {(["Needs", "Wants", "Savings"] as MainCategory[]).map((mc) => {
                    const style = getMainCategoryStyle(mc);
                    const items = grouped[mc];
                    if (items.length === 0) return null;

                    const totalAlloc = items.reduce((s, i) => s + i.allocation, 0);
                    const totalSpent = items.reduce((s, i) => s + i.spent, 0);

                    return (
                        <div key={mc}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm">{style.emoji}</span>
                                <span className={cn("text-xs font-semibold uppercase tracking-wider", style.pillText)}>
                                    {style.label}
                                </span>
                                <span className={cn("text-[10px] font-medium rounded-full px-2 py-0.5 ml-auto", style.pillBg, style.pillText)}>
                                    {formatCurrency(totalSpent)} / {formatCurrency(totalAlloc)}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {items.map((item) => {
                                    const pct = Math.min(item.percentage, 100);
                                    const isOver = item.percentage > 100;
                                    const isWarning = item.percentage >= 80 && !isOver;

                                    return (
                                        <div key={item.id} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-foreground">
                                                    {item.category?.name}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-currency text-muted-foreground mr-1">
                                                        {formatCurrency(item.spent)}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">/</span>

                                                    {editingId === item.id ? (
                                                        <Input
                                                            autoFocus
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={() => handleSave(item.id)}
                                                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                                                            className="h-6 w-24 text-[11px] font-currency px-1 text-right inline-flex"
                                                        />
                                                    ) : (
                                                        <span
                                                            onClick={() => handleEditClick(item.id, item.allocation)}
                                                            className="text-[11px] font-currency font-medium text-foreground hover:bg-gray-100 px-1 py-0.5 rounded cursor-text transition-colors"
                                                            title="Klik untuk mengedit"
                                                        >
                                                            {formatCurrency(item.allocation)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : style.barColor
                                                    )}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            {(isOver || isWarning) && (
                                                <span className={cn(
                                                    "text-[10px] font-medium",
                                                    isOver ? "text-red-500" : "text-amber-600"
                                                )}>
                                                    {isOver ? `Melebihi ${item.percentage - 100}%!` : `${item.percentage}% terpakai`}
                                                </span>
                                            )}
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
