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
import { Switch } from "@/components/ui/switch";
import { useCreateReminder } from "@/hooks/use-queries";
import { toast } from "sonner";

export function AddReminderDialog() {
    const [open, setOpen] = useState(false);
    const createReminder = useCreateReminder();

    const [form, setForm] = useState({
        title: "",
        amount: "",
        dueDate: new Date().toISOString().split("T")[0],
        isRecurring: false,
    });

    const handleSubmit = async () => {
        if (!form.title || !form.dueDate) return;

        try {
            await createReminder.mutateAsync({
                title: form.title,
                amount: form.amount ? Number(form.amount) : 0,
                dueDate: form.dueDate,
                isRecurring: form.isRecurring,
            });
            toast.success("Pengingat berhasil ditambahkan");
            setOpen(false);
            setForm({
                title: "",
                amount: "",
                dueDate: new Date().toISOString().split("T")[0],
                isRecurring: false,
            });
        } catch {
            toast.error("Gagal menambahkan pengingat");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:opacity-50">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Pengingat Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-primary/15">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Pengingat Baru 🔔
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">Nama Tagihan/Pengingat</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="Contoh: Tagihan WiFi, Listrik..."
                            className="h-10 rounded-xl border-primary/15 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">Jumlah (Rp) <span className="text-muted-foreground font-normal">(Opsional)</span></Label>
                        <Input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                            placeholder="0"
                            className="h-10 font-currency rounded-xl border-primary/15 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">Tenggat Waktu</Label>
                        <Input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                            className="h-10 rounded-xl border-primary/15 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Recurring toggle */}
                    <div className="flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2.5">
                        <div>
                            <p className="text-sm font-medium text-foreground">Tagihan berulang?</p>
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
                        className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 font-medium mt-2"
                        disabled={!form.title || !form.dueDate || createReminder.isPending}
                    >
                        {createReminder.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Pengingat"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
