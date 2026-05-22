"use client";

import Link from "next/link";
import {
    Home,
    ShoppingCart,
    Car,
    Wifi,
    Shield,
    Film,
    UtensilsCrossed,
    ShoppingBag,
    Heart,
    CreditCard,
    ShieldCheck,
    TrendingUp,
    ArrowRight,
    PiggyBank,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
    Home,
    ShoppingCart,
    Car,
    Wifi,
    Shield,
    Film,
    UtensilsCrossed,
    ShoppingBag,
    Heart,
    CreditCard,
    ShieldCheck,
    TrendingUp,
    PiggyBank,
};

function getCategoryBadgeStyle(mainCategory: string) {
    switch (mainCategory) {
        case "Needs":
            return "bg-purple-50 text-purple-700 border-purple-200";
        case "Wants":
            return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
        case "Savings":
            return "bg-blue-50 text-blue-700 border-blue-200";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
}

function getCategoryLabel(mainCategory: string) {
    switch (mainCategory) {
        case "Needs": return "Kebutuhan";
        case "Wants": return "Keinginan";
        case "Savings": return "Tabungan";
        default: return mainCategory;
    }
}

export function RecentTransactions() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: allTransactions, isLoading } = useTransactions(currentMonth, currentYear, "Kartu Utama");

    // Safety check map to fallback category info if empty
    const transactions = (allTransactions || []).map(txn => ({
        ...txn,
        category: txn.category || { id: '', name: 'Uncategorized', mainCategory: 'Needs', icon: 'ShoppingCart' }
    })).slice(0, 5);

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Transaksi Terbaru</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">5 transaksi terakhir</p>
                </div>
                <Link
                    href="/transactions"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <span>Lihat Semua</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="space-y-1">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-3 py-2 animate-pulse">
                                <div className="h-9 w-9 rounded-xl bg-primary/10" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3 w-3/4 bg-primary/10 rounded" />
                                    <div className="h-2 w-1/4 bg-primary/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">Belum ada transaksi bulan ini</div>
                ) : (
                    transactions.map((txn, idx) => {
                        const Icon = iconMap[txn.category.icon ?? ""] ?? CreditCard;
                        const isExpense = txn.amount < 0;

                        return (
                            <div
                                key={txn.id}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-primary/5 cursor-pointer",
                                    idx !== transactions.length - 1 && "border-b border-primary/5"
                                )}
                            >
                                {/* Icon */}
                                <div className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                                    isExpense ? "bg-rose-50" : "bg-emerald-50"
                                )}>
                                    <Icon className={cn(
                                        "h-4 w-4",
                                        isExpense ? "text-rose-500" : "text-emerald-500"
                                    )} />
                                </div>

                                {/* Description */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {txn.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatDate(txn.date)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">•</span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {txn.accountName}
                                        </span>
                                    </div>
                                </div>

                                {/* Category Badge */}
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium border",
                                        getCategoryBadgeStyle(txn.category.mainCategory)
                                    )}
                                >
                                    {getCategoryLabel(txn.category.mainCategory)}
                                </Badge>

                                {/* Amount */}
                                <span className={cn(
                                    "text-sm font-semibold font-currency whitespace-nowrap",
                                    isExpense ? "text-rose-500" : "text-emerald-600"
                                )}>
                                    {isExpense ? "-" : "+"}{formatCurrency(Math.abs(txn.amount))}
                                </span>
                            </div>
                        );
                    }))}
            </div>
        </div>
    );
}
