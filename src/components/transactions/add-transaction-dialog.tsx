"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCategories, useCreateTransaction } from "@/hooks/use-queries";
import { toast } from "sonner";

const accountNames = ["Cash", "Bank Mandiri", "BCA", "GoPay", "Credit Card"];

export function AddTransactionDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { data: categories = [], isLoading: isLoadingCats } = useCategories();
    const createTx = useCreateTransaction();

    const [form, setForm] = useState({
        description: "",
        amount: "",
        categoryId: "",
        accountName: "",
        date: new Date().toISOString().split("T")[0],
        isRecurring: false,
    });

    const handleSubmit = async () => {
        if (!form.description || !form.amount || !form.categoryId || !form.accountName) return;

        const selectedCat = categories.find(c => c.id === form.categoryId);
        const isIncome = selectedCat?.mainCategory === "Income";
        const finalAmount = isIncome ? Number(form.amount) : -Number(form.amount);

        try {
            await createTx.mutateAsync({
                description: form.description,
                amount: finalAmount,
                categoryId: form.categoryId,
                accountName: form.accountName,
                date: form.date,
                isRecurring: form.isRecurring,
            });
            toast.success("Transaksi berhasil ditambahkan");
            setOpen(false);
            setForm({
                description: "",
                amount: "",
                categoryId: "",
                accountName: "",
                date: new Date().toISOString().split("T")[0],
                isRecurring: false,
            });
        } catch {
            toast.error("Gagal menambahkan transaksi");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Tambah Transaksi
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-primary/15">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Transaksi Baru ✏️
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">Deskripsi</Label>
                        <Input
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="Contoh: Belanja mingguan..."
                            className="h-10 rounded-xl border-primary/15 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">Jumlah (Rp)</Label>
                        <Input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                            placeholder="0"
                            className="h-10 font-currency rounded-xl border-primary/15 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Category & Account row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Kategori</Label>
                            <Select
                                value={form.categoryId}
                                onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-primary/15 focus:ring-primary/30 text-sm">
                                    <SelectValue placeholder="Pilih..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-primary/15">
                                    {isLoadingCats ? (
                                        <SelectItem value="loading" disabled>Memuat kategori...</SelectItem>
                                    ) : (
                                        categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id} className="text-sm">
                                                {cat.name} ({cat.mainCategory})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Akun</Label>
                            <Select
                                value={form.accountName}
                                onValueChange={(v) => setForm((p) => ({ ...p, accountName: v }))}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-primary/15 focus:ring-primary/30 text-sm">
                                    <SelectValue placeholder="Pilih..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-primary/15">
                                    {accountNames.map((acc) => (
                                        <SelectItem key={acc} value={acc} className="text-sm">
                                            {acc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">Tanggal</Label>
                        <Input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                            className="h-10 rounded-xl border-primary/15 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Recurring toggle */}
                    <div className="flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2.5">
                        <div>
                            <p className="text-sm font-medium text-foreground">Transaksi berulang?</p>
                            <p className="text-[11px] text-muted-foreground">Otomatis setiap bulan</p>
                        </div>
                        <Switch
                            checked={form.isRecurring}
                            onCheckedChange={(v) => setForm((p) => ({ ...p, isRecurring: v }))}
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 font-medium"
                        disabled={!form.description || !form.amount || !form.categoryId || !form.accountName || createTx.isPending}
                    >
                        {createTx.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Transaksi"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
