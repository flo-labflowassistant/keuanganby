"use client";

import {
    Home, ShoppingCart, Car, Wifi, Shield, Film,
    UtensilsCrossed, ShoppingBag, Heart, CreditCard,
    ShieldCheck, TrendingUp, RotateCcw, Trash2, Loader2
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Transaction, Category } from "@/types";
import { useDeleteTransaction } from "@/hooks/use-queries";
import { useState } from "react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
    Home, ShoppingCart, Car, Wifi, Shield, Film,
    UtensilsCrossed, ShoppingBag, Heart, CreditCard,
    ShieldCheck, TrendingUp,
};

function getCategoryBadgeStyle(mainCategory: string) {
    switch (mainCategory) {
        case "Needs": return "bg-purple-50 text-purple-700 border-purple-200";
        case "Wants": return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
        case "Savings": return "bg-blue-50 text-blue-700 border-blue-200";
        default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
}

interface TransactionTableProps {
    transactions: (Transaction & { category: Category })[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
    const deleteTxn = useDeleteTransaction();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent clicking the row
        setDeletingId(id);
        try {
            await deleteTxn.mutateAsync(id);
            toast.success("Transaksi berhasil dihapus");
        } catch (error) {
            console.error("Failed to delete transaction", error);
            toast.error("Gagal menghapus transaksi.");
        } finally {
            setDeletingId(null);
        }
    };
    if (transactions.length === 0) {
        return (
            <div className="rounded-2xl border border-primary/10 bg-white p-10 text-center">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm font-medium text-foreground">Tidak ada transaksi</p>
                <p className="text-xs text-muted-foreground mt-1">Ubah filter atau tambah transaksi baru</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-primary/10 bg-white overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_120px_120px_120px_100px_40px] gap-2 px-4 py-2.5 bg-primary/5 border-b border-primary/10">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Transaksi</span>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Kategori</span>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Akun</span>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Jumlah</span>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Tanggal</span>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Aksi</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-primary/5">
                {transactions.map((txn) => {
                    const Icon = iconMap[txn.category.icon ?? ""] ?? CreditCard;
                    const isExpense = txn.amount < 0;

                    return (
                        <div
                            key={txn.id}
                            className="group flex flex-col sm:grid sm:grid-cols-[1fr_120px_120px_120px_100px_40px] gap-1 sm:gap-2 sm:items-center px-4 py-3 hover:bg-primary/3 transition-colors cursor-pointer relative"
                        >
                            {/* Transaction info */}
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                    isExpense ? "bg-rose-50" : "bg-emerald-50"
                                )}>
                                    <Icon className={cn("h-3.5 w-3.5", isExpense ? "text-rose-500" : "text-emerald-500")} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {txn.description}
                                    </p>
                                    {txn.isRecurring && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <RotateCcw className="h-2.5 w-2.5" /> Berulang
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                                        getCategoryBadgeStyle(txn.category.mainCategory)
                                    )}
                                >
                                    {txn.category.name}
                                </Badge>
                            </div>

                            {/* Account */}
                            <span className="text-xs text-muted-foreground">{txn.accountName}</span>

                            {/* Amount */}
                            <span className={cn(
                                "text-sm font-semibold font-currency whitespace-nowrap sm:text-right",
                                isExpense ? "text-rose-500" : "text-emerald-600"
                            )}>
                                {isExpense ? "-" : "+"}{formatCurrency(Math.abs(txn.amount))}
                            </span>

                            {/* Date */}
                            <span className="text-xs text-muted-foreground sm:text-right">
                                {formatDate(txn.date)}
                            </span>

                            {/* Delete Action */}
                            <div className="absolute top-3 right-4 sm:static flex justify-end">
                                <button
                                    onClick={(e) => handleDelete(txn.id, e)}
                                    disabled={deletingId === txn.id}
                                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    {deletingId === txn.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
