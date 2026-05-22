"use client";

import { useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MONTH_NAMES } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";
import { useMonthlyTrend, useBudgetStatus, useCategories, useTransactions } from "@/hooks/use-queries";

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; name: string }>; label?: string }) {
    if (!active || !payload) return null;
    return (
        <div className="rounded-xl border border-primary/15 bg-white/95 backdrop-blur-sm p-3 shadow-xl shadow-primary/5">
            <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((e) => (
                <div key={e.name} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                    <span className="text-[11px] text-muted-foreground">{e.name}</span>
                    <span className="text-[11px] font-currency font-semibold text-foreground ml-auto">
                        {e.name === "% Rasio" ? `${e.value}%` : formatCurrency(e.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

const COLORS = ["#a855f7", "#d946ef", "#3b82f6"];

export default function ReportsPage() {
    const { currentMonth, currentYear } = useUIStore();

    const { data: trendData = [], isLoading: loadingTrend } = useMonthlyTrend(currentMonth, currentYear);
    const { data: budgetStatus = [], isLoading: loadingBudget } = useBudgetStatus(currentMonth, currentYear);
    const { data: categories = [], isLoading: loadingCats } = useCategories();
    const { data: transactions = [], isLoading: loadingTxns } = useTransactions(currentMonth, currentYear, "Kartu Utama");

    // --- Data prep ---
    const barData = useMemo(() => {
        return trendData.map((d) => ({
            name: MONTH_NAMES[d.month - 1]?.substring(0, 3) ?? `${d.month}`,
            Pemasukan: d.income,
            Pengeluaran: d.expenses,
        }));
    }, [trendData]);

    const savingsLineData = useMemo(() => {
        return trendData.map((d) => ({
            name: MONTH_NAMES[d.month - 1]?.substring(0, 3) ?? `${d.month}`,
            Tabungan: d.savings,
            "% Rasio": d.income > 0 ? Math.round((d.savings / d.income) * 100) : 0,
        }));
    }, [trendData]);

    const pieData = useMemo(() => {
        return budgetStatus.map((s, i) => ({
            name: s.category,
            value: s.spent,
            fill: COLORS[i % COLORS.length],
        })).filter(s => s.value > 0);
    }, [budgetStatus]);

    const categorySpending = useMemo(() => {
        return categories
            .filter((c) => c.mainCategory !== "Savings")
            .map((cat) => {
                const spent = transactions
                    .filter((t) => t.categoryId === cat.id && t.amount < 0)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                return { name: cat.name, Pengeluaran: spent };
            })
            .filter((c) => c.Pengeluaran > 0)
            .sort((a, b) => b.Pengeluaran - a.Pengeluaran);
    }, [categories, transactions]);

    const isLoading = loadingTrend || loadingBudget || loadingCats || loadingTxns;

    if (isLoading) {
        return (
            <div className="space-y-6 flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Menyiapkan laporan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Laporan Keuangan 📊
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Analisis dan visualisasi keuanganmu
                </p>
            </div>

            {/* Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Income vs Expenses Bar Chart */}
                <div className="rounded-2xl border border-primary/10 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Pemasukan vs Pengeluaran</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">6 bulan terakhir</p>
                        </div>
                        <span className="text-sm">📊</span>
                    </div>
                    <div className="h-[250px]">
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                                <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#f3e8ff" }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${v / 1000}k`} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                                    <Bar dataKey="Pemasukan" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={20} />
                                    <Bar dataKey="Pengeluaran" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed border-primary/10 rounded-xl">Belum ada data</div>
                        )}
                    </div>
                </div>

                {/* 2. Savings Trend Line */}
                <div className="rounded-2xl border border-primary/10 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Tren Tabungan</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Jumlah & rasio tabungan</p>
                        </div>
                        <span className="text-sm">📈</span>
                    </div>
                    <div className="h-[250px]">
                        {savingsLineData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                                <LineChart data={savingsLineData} margin={{ top: 5, right: 5, left: -15, bottom: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#f3e8ff" }} tickLine={false} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : `${v / 1000}k`} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                                    <Line yAxisId="left" type="monotone" dataKey="Tabungan" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
                                    <Line yAxisId="right" type="monotone" dataKey="% Rasio" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed border-primary/10 rounded-xl">Belum ada data</div>
                        )}
                    </div>
                </div>

                {/* 3. Spending Distribution Pie */}
                <div className="rounded-2xl border border-primary/10 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Distribusi Pengeluaran</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Needs vs Wants vs Savings</p>
                        </div>
                        <span className="text-sm">🍩</span>
                    </div>
                    <div className="h-[250px] flex items-center justify-center">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {pieData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: "11px" }}
                                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                        formatter={(value: any) => {
                                            const item = pieData.find((p) => p.name === value);
                                            return `${value} — ${item ? formatCurrency(item.value) : ""}`;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground border border-dashed border-primary/10 rounded-xl">Belum ada data pengeluaran</div>
                        )}
                    </div>
                </div>

                {/* 4. Top Categories Horizontal Bar */}
                <div className="rounded-2xl border border-primary/10 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Pengeluaran per Kategori</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Bulan ini</p>
                        </div>
                        <span className="text-sm">🏷️</span>
                    </div>
                    <div className="h-[250px]">
                        {categorySpending.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                                <BarChart data={categorySpending} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1_000_000).toFixed(1)}jt` : `${(v / 1_000).toFixed(0)}rb`} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={100} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="Pengeluaran" fill="#a855f7" radius={[0, 6, 6, 0]} barSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed border-primary/10 rounded-xl">Belum ada data pengeluaran</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
