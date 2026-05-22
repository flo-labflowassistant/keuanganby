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
import { useCreateSavingGoal } from "@/hooks/use-queries";
import { formatDateInputValue } from "@/lib/utils";
import { toast } from "sonner";

const goalIcons = [
    { value: "Target", label: "🎯 Target Umum", emoji: "🎯" },
    { value: "ShieldCheck", label: "🛡️ Dana Darurat", emoji: "🛡️" },
    { value: "Plane", label: "✈️ Liburan", emoji: "✈️" },
    { value: "Laptop", label: "💻 Gadget & Elektronik", emoji: "💻" },
    { value: "GraduationCap", label: "🎓 Pendidikan", emoji: "🎓" },
];

function getDefaultDeadline() {
    const deadline = new Date();
    deadline.setFullYear(deadline.getFullYear() + 1);
    return formatDateInputValue(deadline);
}

export function AddSavingGoalDialog() {
    const [open, setOpen] = useState(false);
    const createGoal = useCreateSavingGoal();

    const [form, setForm] = useState({
        name: "",
        targetAmount: "",
        deadline: getDefaultDeadline(),
        icon: "Target",
    });

    const handleSubmit = async () => {
        if (!form.name || !form.targetAmount || !form.deadline) return;

        try {
            await createGoal.mutateAsync({
                name: form.name,
                targetAmount: Number(form.targetAmount),
                currentAmount: 0,
                deadline: form.deadline,
                icon: form.icon,
            });
            toast.success("Target tabungan berhasil ditambahkan");
            setOpen(false);
            setForm({
                name: "",
                targetAmount: "",
                deadline: getDefaultDeadline(),
                icon: "Target",
            });
        } catch {
            toast.error("Gagal menambahkan target tabungan");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:opacity-50">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Target Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-primary/15">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Target Tabungan Baru 🎯
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">Nama Target</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Contoh: Beli Laptop Baru..."
                            className="h-10 rounded-xl border-primary/15 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">Target Jumlah (Rp)</Label>
                        <Input
                            type="number"
                            value={form.targetAmount}
                            onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))}
                            placeholder="0"
                            className="h-10 font-currency rounded-xl border-primary/15 focus-visible:ring-primary/30"
                        />
                    </div>

                    {/* Deadline & Icon row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Tenggat Waktu</Label>
                            <Input
                                type="date"
                                value={form.deadline}
                                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                                className="h-10 rounded-xl border-primary/15 focus-visible:ring-primary/30"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Ikon</Label>
                            <Select
                                value={form.icon}
                                onValueChange={(v) => setForm((p) => ({ ...p, icon: v }))}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-primary/15 focus:ring-primary/30 text-sm">
                                    <SelectValue placeholder="Pilih..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-primary/15">
                                    {goalIcons.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value} className="text-sm">
                                            {icon.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 font-medium mt-2"
                        disabled={!form.name || !form.targetAmount || !form.deadline || createGoal.isPending}
                    >
                        {createGoal.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Target"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
