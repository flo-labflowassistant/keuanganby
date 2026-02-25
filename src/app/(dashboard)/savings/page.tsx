"use client";

import { Plus, Target, Trophy, Calendar, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { useCategories, useSavingGoals, useMonthlyBudgets, useDeleteSavingGoal } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import { AddSavingGoalDialog } from "@/components/budget/add-saving-goal-dialog";
import { AddSavingBalanceDialog } from "@/components/budget/add-saving-balance-dialog";

export function getGoalIcon(icon?: string): string {
    switch (icon) {
        case "ShieldCheck": return "🛡️";
        case "Plane": return "✈️";
        case "Laptop": return "💻";
        case "GraduationCap": return "🎓";
        case "circle": return "🔵";
        default: return "🎯";
    }
}

export default function SavingsPage() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: categories = [], isLoading: loadingCats } = useCategories();
    const { data: savingGoals = [], isLoading: loadingGoals } = useSavingGoals();
    const { data: monthlyBudgets = [], isLoading: loadingBudgets } = useMonthlyBudgets(currentMonth, currentYear);
    const deleteGoal = useDeleteSavingGoal();
    const isLoading = loadingCats || loadingBudgets;

    const handleDeleteGoal = (id: string, name: string) => {
        if (window.confirm(`Yakin ingin menghapus target "${name}"?`)) {
            deleteGoal.mutate(id);
        }
    };

    // Filter only Savings categories
    const savingsCats = categories.filter(c => c.mainCategory === 'Savings');
    const getBudget = (categoryId: string) => monthlyBudgets.find(b => b.categoryId === categoryId)?.amount || 0;
    const totalSavings = savingsCats.reduce((sum, c) => sum + getBudget(c.id), 0);

    const activeGoals = savingGoals.filter((g) => !g.isAchieved);
    const achievedGoals = savingGoals.filter((g) => g.isAchieved);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Tabungan & Target 🎯
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isLoading ? (
                            <span className="inline-block translate-y-1"><Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-1" /></span>
                        ) : (
                            <span className="font-currency font-semibold text-blue-600">
                                {formatCurrency(totalSavings)}
                            </span>
                        )}
                    </p>
                </div>
                <AddSavingGoalDialog />
            </div>

            {/* Monthly Savings */}
            <div className="rounded-2xl border border-primary/10 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <span className="text-sm">💰</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Tabungan Bulan Ini</h3>
                        <p className="text-xs text-muted-foreground">Sesuai Alokasi Anggaran</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {isLoading ? (
                        <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : savingsCats.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">Belum ada alokasi tabungan di bulan ini.</div>
                    ) : savingsCats.map((saving) => (
                        <div
                            key={saving.id}
                            className="flex items-center justify-between rounded-xl bg-blue-50/50 px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{getGoalIcon(saving.icon)}</span>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{saving.name}</p>
                                </div>
                            </div>
                            <span className="text-sm font-currency font-semibold text-blue-600">
                                {formatCurrency(getBudget(saving.id))}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Goals */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Target Aktif</h3>
                    <Badge variant="outline" className="rounded-full text-[10px] border-primary/20 text-primary">
                        {activeGoals.length} target
                    </Badge>
                </div>

                {loadingGoals ? (
                    <div className="py-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : activeGoals.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground rounded-2xl border border-dashed border-primary/20">
                        Belum ada target tabungan yang aktif.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeGoals.map((goal) => {
                            const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                            const remaining = goal.targetAmount - goal.currentAmount;
                            const deadline = new Date(goal.deadline);
                            const monthsLeft = Math.max(
                                0,
                                (deadline.getFullYear() - new Date().getFullYear()) * 12 + (deadline.getMonth() - new Date().getMonth())
                            );

                            return (
                                <div
                                    key={goal.id}
                                    className="group rounded-2xl border border-primary/10 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                                >
                                    {/* Icon & Title */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{getGoalIcon(goal.icon)}</span>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{goal.name}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {monthsLeft > 0 ? `${monthsLeft} bulan lagi` : 'Bulan ini'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id, goal.name)}
                                                    className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                                                    disabled={deleteGoal.isPending}
                                                    title="Hapus Target"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "rounded-full text-[10px] font-medium border",
                                                        pct >= 60
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                    )}
                                                >
                                                    {pct}%
                                                </Badge>
                                            </div>
                                            <AddSavingBalanceDialog goal={goal} />
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-currency text-primary font-medium">
                                                {formatCurrency(goal.currentAmount)}
                                            </span>
                                            <span className="text-[11px] font-currency text-muted-foreground">
                                                {formatCurrency(goal.targetAmount)}
                                            </span>
                                        </div>

                                        <div className="h-2.5 w-full rounded-full bg-primary/10 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>

                                        <p className="text-[11px] text-muted-foreground">
                                            Kurang{" "}
                                            <span className="font-currency font-medium text-foreground">
                                                {formatCurrency(remaining)}
                                            </span>
                                            {monthsLeft > 0 && (
                                                <> • ~{formatCurrency(Math.ceil(remaining / monthsLeft))}/bulan</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Achieved Goals */}
            {!loadingGoals && achievedGoals.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-foreground">Target Tercapai</h3>
                    </div>

                    <div className="space-y-2">
                        {achievedGoals.map((goal) => (
                            <div
                                key={goal.id}
                                className="flex items-center justify-between rounded-xl bg-emerald-50/50 border border-emerald-100 px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{getGoalIcon(goal.icon)}</span>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{goal.name}</p>
                                        <p className="text-[11px] text-emerald-600">✓ Target tercapai</p>
                                    </div>
                                </div>
                                <span className="text-sm font-currency font-semibold text-emerald-600">
                                    {formatCurrency(goal.targetAmount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
