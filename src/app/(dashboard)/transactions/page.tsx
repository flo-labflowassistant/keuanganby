"use client";

import { useState, useMemo } from "react";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePaginatedTransactions } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import type { MainCategory, TransactionFilter, PaginatedResponse, Transaction } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
    const { currentMonth, currentYear } = useUIStore();
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    const [search, setSearch] = useState("");
    const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
    const [accountName, setAccountName] = useState<string | null>(null);

    // Reset to page 1 when filters change
    useMemo(() => {
        setPage(1);
    }, [search, mainCategory, accountName, currentMonth, currentYear]);

    const filterOptions: TransactionFilter = useMemo(() => ({
        month: currentMonth,
        year: currentYear,
        page,
        limit: LIMIT,
        search,
        categoryId: null, // Global transaction page searches by mainCategory, specific categorId if needed
        mainCategory,
        accountName
    }), [currentMonth, currentYear, page, LIMIT, search, mainCategory, accountName]);

    const { data: rawData, isFetching } = usePaginatedTransactions(filterOptions);
    const paginatedResult = rawData as PaginatedResponse<Transaction> | undefined;

    // Fallback data structure with forced type cast
    const transactions = (paginatedResult?.data || []).map(t => ({
        ...t,
        category: t.category || { id: '', name: 'Uncategorized', mainCategory: 'Needs', icon: 'ShoppingCart' }
    })) as (Transaction & { category: any })[];
    const totalPages = paginatedResult?.totalPages || 1;
    const totalTransactions = paginatedResult?.count || 0;

    // Total expenses shown for the current page. If needing global, that requires a separate summary API. 
    // Usually paginated views don't show global sum here, or we accept showing page sum
    const currentExpenses = (transactions as any[])
        .filter((t: any) => t.amount < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Pencatatan Transaksi 💸
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {totalTransactions} total transaksi
                    </p>
                </div>
                <AddTransactionDialog />
            </div>

            {/* Filters */}
            <TransactionFilters
                search={search}
                onSearchChange={setSearch}
                mainCategory={mainCategory}
                onMainCategoryChange={setMainCategory}
                accountName={accountName}
                onAccountNameChange={setAccountName}
            />

            {/* Table */}
            <div className="relative">
                {isFetching && (
                    <div className="absolute inset-0 z-10 flex border items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-2xl">
                        <LoadingSpinner />
                    </div>
                )}

                <TransactionTable transactions={transactions} />
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 pb-8">
                    <p className="text-xs text-muted-foreground">
                        Halaman {page} dari {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isFetching}
                            className="rounded-xl h-8 text-xs px-3"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isFetching}
                            className="rounded-xl h-8 text-xs px-3"
                        >
                            Selanjutnya
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
