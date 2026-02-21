"use client";

import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useCategories, useUpdateCategoryBudget, useMonthlyBudgets } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";

export function IncomeSourcesForm() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: categories = [], isLoading: loadingCats } = useCategories();
    const { data: monthlyBudgets = [], isLoading: loadingBudgets } = useMonthlyBudgets(currentMonth, currentYear);
    const isLoading = loadingCats || loadingBudgets;
    const updateBudgetObj = useUpdateCategoryBudget();

    // Filter only Income categories
    const incomeCategories = categories.filter(c => c.mainCategory === 'Income');

    // Helper to get budget
    const getBudget = (categoryId: string) => monthlyBudgets.find(b => b.categoryId === categoryId)?.amount || 0;

    const totalIncome = incomeCategories.reduce((sum, c) => sum + getBudget(c.id), 0);

    const updateSource = async (id: string, value: number) => {
        try {
            await updateBudgetObj.mutateAsync({ id, allocation: value, month: currentMonth, year: currentYear });
            toast.success("Alokasi tersimpan");
        } catch {
            toast.error("Gagal menyimpan alokasi");
        }
    };

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                        <Briefcase className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Sumber Pemasukan</h3>
                        <p className="text-xs text-muted-foreground">Masukkan semua pendapatan bulan ini</p>
                    </div>
                </div>
                <span className="text-sm font-currency font-semibold text-emerald-600">
                    {formatCurrency(totalIncome)}
                </span>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">Memuat data pemasukan...</div>
                ) : incomeCategories.map((source) => (
                    <div key={source.id} className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Sumb. Pemasukan</Label>
                            <div className="h-9 px-3 flex items-center text-sm rounded-xl border border-primary/10 bg-gray-50 text-foreground">
                                {source.name}
                            </div>
                        </div>
                        <div className="w-48 space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Estimasi Jumlah</Label>
                            <Input
                                type="number"
                                defaultValue={getBudget(source.id) || ""}
                                onBlur={(e) => updateSource(source.id, Number(e.target.value))}
                                placeholder="0"
                                className="h-9 text-sm font-currency rounded-xl border-primary/15 focus-visible:ring-primary/30"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl w-full"
                disabled
            >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Kategori (Opsional)
            </Button>
        </div>
    );
}
