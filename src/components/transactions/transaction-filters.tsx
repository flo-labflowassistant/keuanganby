"use client";

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MainCategory } from "@/types";
import { useAccounts } from "@/hooks/use-queries";

interface TransactionFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    mainCategory: MainCategory | null;
    onMainCategoryChange: (value: MainCategory | null) => void;
    accountName: string | null;
    onAccountNameChange: (value: string | null) => void;
}

const mainCategories: { value: MainCategory; label: string; emoji: string }[] = [
    { value: "Needs", label: "Kebutuhan", emoji: "🏠" },
    { value: "Wants", label: "Keinginan", emoji: "✨" },
    { value: "Savings", label: "Tabungan", emoji: "🐷" },
];

export function TransactionFilters({
    search,
    onSearchChange,
    mainCategory,
    onMainCategoryChange,
    accountName,
    onAccountNameChange,
}: TransactionFiltersProps) {
    const { data: accounts = [] } = useAccounts();
    const hasFilters = mainCategory !== null || accountName !== null;

    const clearFilters = () => {
        onMainCategoryChange(null);
        onAccountNameChange(null);
    };

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-4 space-y-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cari transaksi..."
                    className="pl-9 h-10 rounded-xl border-primary/15 focus-visible:ring-primary/30"
                />
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />

                {/* Main Category */}
                {mainCategories.map((mc) => (
                    <Badge
                        key={mc.value}
                        variant="outline"
                        className={cn(
                            "cursor-pointer rounded-full px-3 py-1 text-[11px] font-medium transition-all border",
                            mainCategory === mc.value
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-foreground border-primary/15 hover:border-primary/30"
                        )}
                        onClick={() =>
                            onMainCategoryChange(mainCategory === mc.value ? null : mc.value)
                        }
                    >
                        <span className="mr-1">{mc.emoji}</span>
                        {mc.label}
                    </Badge>
                ))}

                <span className="text-[10px] text-muted-foreground">|</span>

                {/* Account */}
                {accounts.map((acc) => (
                    <Badge
                        key={acc.id}
                        variant="outline"
                        className={cn(
                            "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-all border",
                            accountName === acc.name
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-foreground border-primary/15 hover:border-primary/30"
                        )}
                        onClick={() => onAccountNameChange(accountName === acc.name ? null : acc.name)}
                    >
                        {acc.name}
                    </Badge>
                ))}

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}
