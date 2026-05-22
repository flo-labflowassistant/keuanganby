"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";

export function BudgetSummaryBar() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: transactions = [], isLoading } = useTransactions(currentMonth, currentYear, "Kartu Utama");

    const totalIncome = transactions
        .filter((txn) => txn.amount > 0)
        .reduce((sum, txn) => sum + txn.amount, 0);

    const totalTabungan = transactions
        .filter((txn) => txn.amount < 0 && txn.category?.mainCategory === "Savings")
        .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

    const totalTerpakai = transactions
        .filter((txn) => txn.amount < 0 && txn.category?.mainCategory !== "Savings")
        .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

    const remaining = totalIncome - totalTerpakai - totalTabungan;

    const cards = [
        {
            label: "Total Pemasukan",
            amount: totalIncome,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            emoji: "Rp",
        },
        {
            label: "Operasional",
            amount: totalTerpakai,
            color: "text-primary",
            bg: "bg-primary/10",
            emoji: "OP",
        },
        {
            label: "Tabungan",
            amount: totalTabungan,
            color: "text-blue-600",
            bg: "bg-blue-50",
            emoji: "TG",
        },
        {
            label: "Sisa Saldo",
            amount: remaining,
            color: remaining >= 0 ? "text-emerald-600" : "text-destructive",
            bg: remaining >= 0 ? "bg-emerald-50" : "bg-red-50",
            emoji: remaining >= 0 ? "OK" : "!",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {isLoading ? (
                <div className="sm:col-span-2 lg:col-span-4 text-center py-4 text-sm text-muted-foreground">
                    Memuat data ringkasan...
                </div>
            ) : cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-2xl border border-primary/10 bg-white p-4 flex items-center gap-3"
                >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold", card.bg, card.color)}>
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
