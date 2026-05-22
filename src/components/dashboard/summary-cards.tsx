"use client";

import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useDashboardSummary } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";

interface SummaryCardProps {
    label: string;
    amount: number;
    trend: number;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
}

function SummaryCard({ label, amount, trend, icon: Icon, iconColor, iconBg }: SummaryCardProps) {
    const isPositive = trend >= 0;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 cursor-pointer">
            {/* Cute decorative blob */}
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
            <div className="absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-primary/3 transition-transform duration-500 group-hover:scale-125" />

            <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-foreground font-currency tracking-tight">
                        {formatCurrency(amount)}
                    </p>
                    <div className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        isPositive
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                    )}>
                        {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{isPositive ? "+" : ""}{trend.toFixed(1)}%</span>
                        <span className="text-muted-foreground font-normal">vs bulan lalu</span>
                    </div>
                </div>

                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBg)}>
                    <Icon className={cn("h-5 w-5", iconColor)} />
                </div>
            </div>
        </div>
    );
}

export function SummaryCards() {
    const { currentMonth, currentYear } = useUIStore();
    const { data, isLoading } = useDashboardSummary(currentMonth, currentYear);

    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[120px] rounded-2xl bg-primary/5 animate-pulse" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: "Total Pemasukan",
            amount: data.totalIncome,
            trend: data.incomeTrend,
            icon: Wallet,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-50",
        },
        {
            label: "Pengeluaran Operasional",
            amount: data.totalExpenses,
            trend: data.expensesTrend,
            icon: CreditCard,
            iconColor: "text-rose-500",
            iconBg: "bg-rose-50",
        },
        {
            label: "Tabungan Bulan Ini",
            amount: data.totalSavings,
            trend: data.savingsTrend,
            icon: PiggyBank,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
                <SummaryCard key={card.label} {...card} />
            ))}
        </div>
    );
}
