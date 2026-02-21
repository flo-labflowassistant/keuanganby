"use client";

import { PiggyBank, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useCategories, useSavingGoals, useMonthlyBudgets } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";

export function SavingsTargetsForm() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: categories = [], isLoading: loadingCats } = useCategories();
    const { data: savingGoals = [], isLoading: loadingGoals } = useSavingGoals();
    const { data: monthlyBudgets = [], isLoading: loadingBudgets } = useMonthlyBudgets(currentMonth, currentYear);
    const isLoading = loadingCats || loadingBudgets;

    // Filter only Savings categories
    const savingsCats = categories.filter(c => c.mainCategory === 'Savings');
    const getBudget = (categoryId: string) => monthlyBudgets.find(b => b.categoryId === categoryId)?.amount || 0;
    const totalSavings = savingsCats.reduce((sum, c) => sum + getBudget(c.id), 0);

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <PiggyBank className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Target Tabungan</h3>
                        <p className="text-xs text-muted-foreground">Alokasi tabungan bulan ini</p>
                    </div>
                </div>
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                    <span className="text-sm font-currency font-semibold text-blue-600">
                        {formatCurrency(totalSavings)}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="py-2 text-center text-xs text-muted-foreground">Memuat...</div>
                ) : savingsCats.length === 0 ? (
                    <div className="py-2 text-center text-xs text-muted-foreground">Belum ada alokasi tabungan</div>
                ) : savingsCats.map((saving) => (
                    <div
                        key={saving.id}
                        className="flex items-center justify-between rounded-xl bg-blue-50/50 px-3 py-2.5"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm">{saving.icon === 'circle' ? '🔵' : (saving.icon || '🐷')}</span>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{saving.name}</p>
                            </div>
                        </div>
                        <span className="text-sm font-currency font-semibold text-blue-600 shrink-0 ml-2">
                            {formatCurrency(getBudget(saving.id))}
                        </span>
                    </div>
                ))}
            </div>

            {/* Active goals preview */}
            <div className="mt-4 pt-4 border-t border-primary/10">
                <p className="text-xs font-medium text-muted-foreground mb-2">Target Aktif</p>
                <div className="space-y-3">
                    {loadingGoals ? (
                        <div className="py-2 text-center text-xs text-muted-foreground">Memuat target...</div>
                    ) : savingGoals.filter((g) => !g.isAchieved).length === 0 ? (
                        <div className="py-2 text-center text-xs text-muted-foreground">Belum ada target</div>
                    ) : savingGoals.filter((g) => !g.isAchieved).slice(0, 2).map((goal) => {
                        const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                        return (
                            <div key={goal.id} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-foreground">{goal.name}</span>
                                    <span className="text-[10px] font-currency text-muted-foreground">
                                        {pct}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Link href="/savings">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl w-full"
                    >
                        Kelola Target
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
