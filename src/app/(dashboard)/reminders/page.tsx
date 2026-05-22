"use client";

import { useState } from "react";
import { Bell, BellOff, Check, Calendar, RotateCcw, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate, parseDateOnly } from "@/lib/utils";
import { useReminders, useUpdateReminderStatus, useDeleteReminder } from "@/hooks/use-queries";
import { AddReminderDialog } from "@/components/reminders/add-reminder-dialog";

export default function RemindersPage() {
    const { data: reminders = [], isLoading } = useReminders();
    const updateStatus = useUpdateReminderStatus();
    const deleteReminderReq = useDeleteReminder();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const toggleComplete = async (id: string, currentStatus: boolean) => {
        await updateStatus.mutateAsync({ id, isCompleted: !currentStatus });
    };

    const upcoming = reminders.filter((r) => !r.isCompleted);
    const completed = reminders.filter((r) => r.isCompleted);

    function getDaysUntil(dateStr: string): number {
        const due = parseDateOnly(dateStr);
        // Compare with today
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    function getUrgencyStyle(days: number) {
        if (days < 0) return { label: "Terlewat!", color: "bg-red-50 text-red-600 border-red-200" };
        if (days <= 3) return { label: `${days} hari lagi`, color: "bg-amber-50 text-amber-600 border-amber-200" };
        if (days <= 7) return { label: `${days} hari lagi`, color: "bg-blue-50 text-blue-600 border-blue-200" };
        return { label: `${days} hari lagi`, color: "bg-gray-50 text-gray-600 border-gray-200" };
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Pengingat 🔔
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center">
                        {isLoading ? (
                            <><Loader2 className="h-4 w-4 animate-spin text-primary mr-1" /> Memuat...</>
                        ) : (
                            `${upcoming.length} pengingat aktif`
                        )}
                    </p>
                </div>
                <AddReminderDialog />
            </div>

            {/* Upcoming */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Akan Datang</h3>
                </div>

                {isLoading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : upcoming.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground rounded-2xl border border-dashed border-primary/20">
                        Tidak ada pengingat aktif.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {upcoming
                            .sort((a, b) => parseDateOnly(a.dueDate).getTime() - parseDateOnly(b.dueDate).getTime())
                            .map((reminder) => {
                                const days = getDaysUntil(reminder.dueDate);
                                const urgency = getUrgencyStyle(days);

                                return (
                                    <div
                                        key={reminder.id}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition-all duration-200 hover:shadow-md",
                                            days < 0 ? "border-red-100 hover:shadow-red-500/5" : "border-primary/10 hover:shadow-primary/5"
                                        )}
                                    >
                                        {/* Check button */}
                                        <button
                                            onClick={() => toggleComplete(reminder.id, reminder.isCompleted)}
                                            disabled={updateStatus.isPending}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 text-primary/30 hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className={cn(
                                                        "text-[11px]",
                                                        days < 0 ? "text-red-600 font-medium" : "text-muted-foreground"
                                                    )}>
                                                        {formatDate(reminder.dueDate)}
                                                    </span>
                                                </div>
                                                {reminder.isRecurring && (
                                                    <div className="flex items-center gap-1">
                                                        <RotateCcw className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-[11px] text-muted-foreground">Bulanan</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Urgency badge */}
                                        <Badge
                                            variant="outline"
                                            className={cn("rounded-full text-[10px] font-medium border shrink-0", urgency.color)}
                                        >
                                            {urgency.label}
                                        </Badge>

                                        {/* Amount */}
                                        {reminder.amount ? (
                                            <span className="text-sm font-currency font-semibold text-foreground shrink-0 w-24 text-right">
                                                {formatCurrency(reminder.amount)}
                                            </span>
                                        ) : (
                                            <span className="w-24 shrink-0"></span> // Placeholder
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Completed */}
            {!isLoading && completed.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3 mt-8">
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-muted-foreground">Selesai</h3>
                    </div>

                    <div className="space-y-2 opacity-75">
                        {completed.map((reminder) => (
                            <div
                                key={reminder.id}
                                className="group flex items-center gap-3 rounded-2xl border border-primary/5 bg-gray-50/50 px-4 py-3 transition-all duration-200"
                            >
                                {/* Check done */}
                                <button
                                    onClick={() => toggleComplete(reminder.id, reminder.isCompleted)}
                                    disabled={updateStatus.isPending}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground line-through">
                                        {reminder.title}
                                    </p>
                                    <span className="text-[11px] text-muted-foreground">
                                        {formatDate(reminder.dueDate)}
                                    </span>
                                </div>

                                {/* End of Info */}
                                <div className="flex items-center gap-3 shrink-0">
                                    {reminder.amount && (
                                        <span className="text-sm font-currency text-muted-foreground w-20 text-right">
                                            {formatCurrency(reminder.amount)}
                                        </span>
                                    )}
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            setDeletingId(reminder.id);
                                            await deleteReminderReq.mutateAsync(reminder.id);
                                            setDeletingId(null);
                                        }}
                                        disabled={deletingId === reminder.id}
                                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        {deletingId === reminder.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
