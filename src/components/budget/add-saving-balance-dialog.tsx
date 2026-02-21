"use client";

import { useState } from "react";
import { Plus, Wallet, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSavingGoalAmount } from "@/hooks/use-queries";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { SavingGoal } from "@/types";

interface AddSavingBalanceDialogProps {
    goal: SavingGoal;
}

export function AddSavingBalanceDialog({ goal }: AddSavingBalanceDialogProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const { mutate: updateGoal, isPending } = useUpdateSavingGoalAmount();

    const remaining = goal.targetAmount - goal.currentAmount;

    // Format input as currency
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value) {
            setAmount(parseInt(value).toLocaleString("id-ID"));
        } else {
            setAmount("");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericAmount = parseInt(amount.replace(/\D/g, ""));

        if (!numericAmount || numericAmount <= 0) {
            toast.error("Masukkan nominal yang valid");
            return;
        }

        updateGoal(
            { id: goal.id, addedAmount: numericAmount, goalName: goal.name },
            {
                onSuccess: () => {
                    toast.success("Saldo berhasil ditambahkan!");
                    setOpen(false);
                    setAmount(""); // Reset form
                },
                onError: (error) => {
                    console.error("Failed to add balance:", error);
                    toast.error("Gagal menambahkan saldo");
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[10px] sm:text-xs rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Saldo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Saldo Target</DialogTitle>
                        <DialogDescription>
                            Tambahkan uang untuk "{goal.name}". Nominal tabungan ini otomatis akan tercatat sebagai pengeluaran bulan ini agar sinkron dengan arus kas Anda.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 mt-2">
                        {/* Summary View */}
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex flex-col items-center justify-center space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Sisa Target</p>
                            <p className="text-xl font-bold font-currency text-primary">
                                {formatCurrency(remaining)}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="font-medium text-slate-700">Nominal Tabungan</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">Rp</span>
                                <Input
                                    id="amount"
                                    placeholder="0"
                                    className="pl-9"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    disabled={isPending}
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground text-right mt-1">
                                Sisa tabungan ini akan dikurangi sebesar {amount ? `Rp ${amount}` : 'Rp 0'}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending || !amount} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
