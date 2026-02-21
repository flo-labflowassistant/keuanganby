"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { useBudgetStatus } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";

function getProgressColor(percentage: number, mainCategory: string): string {
    if (mainCategory === "Savings") return "bg-blue-500";
    if (percentage > 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    if (percentage >= 50) return "bg-primary";
    return "bg-primary/70";
}

function getProgressEmoji(mainCategory: string): string {
    if (mainCategory === "Needs") return "🏠";
    if (mainCategory === "Wants") return "✨";
    return "🐷";
}

function getStatusLabel(percentage: number, mainCategory: string): string {
    if (mainCategory === "Savings") return `${percentage}% Tersimpan`;
    if (percentage > 100) return "Melebihi!";
    return `${percentage}% Terpakai`;
}

export function BudgetUsage() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: budgetStatus, isLoading } = useBudgetStatus(currentMonth, currentYear);

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Penggunaan Anggaran</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Bulan ini</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm">
                    📊
                </div>
            </div>

            <div className="space-y-5">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-primary/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : !budgetStatus || budgetStatus.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">Belum ada data anggaran</div>
                ) : (
                    budgetStatus.map((status) => {
                        const progressColor = getProgressColor(status.percentage, status.mainCategory);
                        const emoji = getProgressEmoji(status.mainCategory);

                        return (
                            <div key={status.mainCategory} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{emoji}</span>
                                        <span className="text-xs font-medium text-foreground">
                                            {status.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-currency text-muted-foreground">
                                            {formatCurrency(status.spent)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">/</span>
                                        <span className="text-xs font-currency text-foreground font-medium">
                                            {formatCurrency(status.allocated)}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="h-2.5 w-full rounded-full bg-primary/10 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-700 ease-out",
                                                progressColor
                                            )}
                                            style={{ width: `${Math.min(status.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span
                                        className={cn(
                                            "text-[10px] font-medium rounded-full px-2 py-0.5",
                                            status.percentage > 100
                                                ? "bg-red-50 text-red-600"
                                                : status.percentage >= 80
                                                    ? "bg-amber-50 text-amber-600"
                                                    : status.mainCategory === "Savings"
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "bg-primary/10 text-primary"
                                        )}
                                    >
                                        {getStatusLabel(status.percentage, status.mainCategory)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-currency">
                                        {status.remaining > 0
                                            ? `Sisa ${formatCurrency(status.remaining)}`
                                            : status.mainCategory === "Savings"
                                                ? "Target tercapai ✓"
                                                : "Habis!"}
                                    </span>
                                </div>
                            </div>
                        );
                    }))}
            </div>
        </div>
    );
}
