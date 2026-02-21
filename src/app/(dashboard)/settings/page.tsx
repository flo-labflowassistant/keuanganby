"use client";

import { useState, useEffect } from "react";
import { Palette, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useSettingsStore } from "@/stores/settings-store";

const tabs = [
    { id: "appearance", label: "Tampilan", icon: Palette },
    { id: "notifications", label: "Notifikasi", icon: Bell },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("appearance");

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Pengaturan ⚙️
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Preferensi aplikasi dan tampilan
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Tab Nav */}
                <div className="lg:w-56 shrink-0">
                    <div className="rounded-2xl border border-border bg-card p-2 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground"
                                            : "text-foreground hover:bg-muted"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1">
                    {activeTab === "appearance" && <AppearanceTab />}
                    {activeTab === "notifications" && <NotificationsTab />}
                </div>
            </div>
        </div>
    );
}

function AppearanceTab() {
    const { theme, setTheme } = useTheme();
    const { themeColor, setThemeColor } = useSettingsStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Tampilan</h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                    <div>
                        <p className="text-sm font-medium text-foreground">Mode Gelap</p>
                        <p className="text-[11px] text-muted-foreground">Kurangi silau saat malam</p>
                    </div>
                    <Switch
                        checked={theme === "dark"}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                </div>

                <div>
                    <p className="text-xs font-medium text-foreground mb-2">Warna Tema Utama</p>
                    <div className="flex gap-2">
                        {["#a855f7", "#ec4899", "#3b82f6", "#22c55e", "#f59e0b"].map((color) => (
                            <button
                                key={color}
                                onClick={() => setThemeColor(color)}
                                className={cn(
                                    "h-8 w-8 rounded-full border-2 transition-all",
                                    themeColor === color ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: color }}
                                aria-label={`Pilih warna ${color}`}
                            />
                        ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                        Pilihan warna hanya sebagai representasi UI dan mungkin perlu konfigurasi sistem CSS penuh untuk diterapkan ke seluruh aplikasi.
                    </p>
                </div>
            </div>
        </div>
    );
}

function NotificationsTab() {
    const {
        emailNotif, setEmailNotif,
        pushNotif, setPushNotif,
        reminderNotif, setReminderNotif,
        budgetAlert, setBudgetAlert
    } = useSettingsStore();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Mencegah hydration mismatch untuk zustand persist
    }

    const items = [
        { label: "Notifikasi Email", desc: "Kirim ringkasan mingguan via email", state: emailNotif, toggle: setEmailNotif },
        { label: "Push Notification", desc: "Notifikasi real-time di browser", state: pushNotif, toggle: setPushNotif },
        { label: "Pengingat Pembayaran", desc: "Peringatan sebelum jatuh tempo", state: reminderNotif, toggle: setReminderNotif },
        { label: "Peringatan Anggaran", desc: "Alert saat anggaran hampir habis", state: budgetAlert, toggle: setBudgetAlert },
    ];

    return (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Pengaturan Notifikasi</h3>

            {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                    <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.state} onCheckedChange={item.toggle} />
                </div>
            ))}
        </div>
    );
}
