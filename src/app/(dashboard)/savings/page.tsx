"use client";

import {
    ArrowDownFromLine,
    ArrowUpFromLine,
    Calendar,
    Loader2,
    PiggyBank,
    Target,
    Trash2,
    Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate, parseDateOnly } from "@/lib/utils";
import {
    useDeleteSavingGoal,
    useSavingGoals,
    useSavingsOverview,
} from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import { AddSavingBalanceDialog } from "@/components/budget/add-saving-balance-dialog";
import { AddSavingGoalDialog } from "@/components/budget/add-saving-goal-dialog";
import type { Transaction } from "@/types";

function SavingsMetricCard({
    label,
    amount,
    description,
    tone,
}: {
    label: string;
    amount: number;
    description: string;
    tone: "primary" | "income" | "expense" | "neutral";
}) {
    const toneClass = {
        primary: "bg-primary/10 text-primary border-primary/15",
        income: "bg-emerald-50 text-emerald-600 border-emerald-100",
        expense: "bg-rose-50 text-rose-600 border-rose-100",
        neutral: "bg-muted text-foreground border-border",
    }[tone];

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-4">
            <div className="flex items-center gap-2">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl border", toneClass)}>
                    <PiggyBank className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </span>
            </div>
            <p className="mt-3 text-xl font-bold font-currency text-foreground">
                {formatCurrency(amount)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
        </div>
    );
}

function SavingsTransactionList({
    title,
    description,
    transactions,
    type,
}: {
    title: string;
    description: string;
    transactions: Transaction[];
    type: "inflow" | "outflow";
}) {
    const isInflow = type === "inflow";
    const Icon = isInflow ? ArrowUpFromLine : ArrowDownFromLine;

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        isInflow ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Badge variant="outline" className="rounded-full text-[10px]">
                    {transactions.length} transaksi
                </Badge>
            </div>

            <div className="flex flex-col gap-2">
                {transactions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-primary/15 bg-primary/[0.02] py-6 text-center text-sm text-muted-foreground">
                        Belum ada transaksi bulan ini.
                    </div>
                ) : transactions.map((txn) => (
                    <div
                        key={txn.id}
                        className={cn(
                            "flex items-center justify-between rounded-xl border px-4 py-3",
                            isInflow ? "border-emerald-100 bg-emerald-50/40" : "border-rose-100 bg-rose-50/40"
                        )}
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{txn.description}</p>
                            <p className="text-[11px] text-muted-foreground">
                                {formatDate(txn.date)}
                                {txn.category?.name ? ` - ${txn.category.name}` : ""}
                            </p>
                        </div>
                        <span className={cn(
                            "ml-3 shrink-0 text-sm font-semibold font-currency",
                            isInflow ? "text-emerald-600" : "text-rose-600"
                        )}>
                            {isInflow ? "+" : "-"}{formatCurrency(Math.abs(txn.amount))}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function SavingsPage() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: overview, isLoading: loadingOverview } = useSavingsOverview(currentMonth, currentYear);
    const { data: savingGoals = [], isLoading: loadingGoals } = useSavingGoals();
    const deleteGoal = useDeleteSavingGoal();

    const activeGoals = savingGoals.filter((goal) => !goal.isAchieved);
    const achievedGoals = savingGoals.filter((goal) => goal.isAchieved);

    const handleDeleteGoal = (id: string, name: string) => {
        if (window.confirm(`Yakin ingin menghapus target "${name}"?`)) {
            deleteGoal.mutate(id);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Tabungan & Target
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Saldo kumulatif, mutasi bulanan, dan target tabungan.
                    </p>
                </div>
                <AddSavingGoalDialog />
            </div>

            {loadingOverview || !overview ? (
                <div className="rounded-2xl border border-primary/10 bg-white p-10 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        <SavingsMetricCard
                            label="Saldo Kartu Tabungan"
                            amount={overview.balance}
                            description="Saldo kumulatif akun tabungan"
                            tone="primary"
                        />
                        <SavingsMetricCard
                            label="Masuk Bulan Ini"
                            amount={overview.monthlyInflow}
                            description="Transfer masuk ke Kartu Tabungan"
                            tone="income"
                        />
                        <SavingsMetricCard
                            label="Keluar Bulan Ini"
                            amount={overview.monthlyOutflow}
                            description="Pengeluaran memakai Kartu Tabungan"
                            tone="expense"
                        />
                        <SavingsMetricCard
                            label="Net Bulan Ini"
                            amount={overview.monthlyNet}
                            description="Masuk dikurangi keluar"
                            tone={overview.monthlyNet >= 0 ? "income" : "expense"}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SavingsTransactionList
                            title="Riwayat Masuk Tabungan"
                            description="Dana dari Kartu Utama ke Kartu Tabungan"
                            transactions={overview.inflowTransactions}
                            type="inflow"
                        />
                        <SavingsTransactionList
                            title="Riwayat Pengeluaran Kartu Tabungan"
                            description="Belanja atau pencairan dari saldo tabungan"
                            transactions={overview.outflowTransactions}
                            type="outflow"
                        />
                    </div>
                </>
            )}

            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Target Aktif</h3>
                    <Badge variant="outline" className="rounded-full text-[10px] border-primary/20 text-primary">
                        {activeGoals.length} target
                    </Badge>
                </div>

                {loadingGoals ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : activeGoals.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground rounded-2xl border border-dashed border-primary/20">
                        Belum ada target tabungan yang aktif.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeGoals.map((goal) => {
                            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                            const deadline = parseDateOnly(goal.deadline);
                            const monthsLeft = Math.max(
                                0,
                                (deadline.getFullYear() - new Date().getFullYear()) * 12 + (deadline.getMonth() - new Date().getMonth())
                            );

                            return (
                                <div
                                    key={goal.id}
                                    className="group rounded-2xl border border-primary/10 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Target className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">{goal.name}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {monthsLeft > 0 ? `${monthsLeft} bulan lagi` : "Bulan ini"}
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
                                                className="h-full rounded-full bg-primary transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>

                                        <p className="text-[11px] text-muted-foreground">
                                            Kurang{" "}
                                            <span className="font-currency font-medium text-foreground">
                                                {formatCurrency(remaining)}
                                            </span>
                                            {monthsLeft > 0 && (
                                                <> - sekitar {formatCurrency(Math.ceil(remaining / monthsLeft))}/bulan</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {!loadingGoals && achievedGoals.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-muted-foreground">Target Tercapai</h3>
                    </div>

                    <div className="flex flex-col gap-2">
                        {achievedGoals.map((goal) => (
                            <div
                                key={goal.id}
                                className="flex items-center justify-between rounded-xl bg-emerald-50/50 border border-emerald-100 px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Trophy className="h-4 w-4 text-emerald-600" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{goal.name}</p>
                                        <p className="text-[11px] text-emerald-600">Target tercapai</p>
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
