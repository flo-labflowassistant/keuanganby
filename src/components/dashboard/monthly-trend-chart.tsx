"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useMonthlyTrend } from "@/hooks/use-queries";
import { useUIStore } from "@/stores/ui-store";
import { MONTH_NAMES } from "@/lib/constants";



function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; name: string }>; label?: string }) {
    if (!active || !payload) return null;

    return (
        <div className="rounded-xl border border-primary/15 bg-white/95 backdrop-blur-sm p-3 shadow-xl shadow-primary/5">
            <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
            <div className="space-y-1.5">
                {payload.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[11px] text-muted-foreground">{entry.name}</span>
                        <span className="text-[11px] font-currency font-semibold text-foreground ml-auto">
                            {formatCurrency(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MonthlyTrendChart() {
    const { currentMonth, currentYear } = useUIStore();
    const { data: trendData, isLoading } = useMonthlyTrend(currentMonth, currentYear);

    const chartData = trendData?.map((d) => ({
        name: MONTH_NAMES[d.month - 1]?.substring(0, 3) ?? `${d.month}`,
        Pemasukan: d.income,
        Pengeluaran: d.expenses,
        Tabungan: d.savings,
    })) || [];

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Tren Bulanan</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">6 bulan terakhir</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm">
                    📈
                </div>
            </div>

            <div className="h-[260px] w-full">
                {isLoading ? (
                    <div className="w-full h-full flex items-end gap-2 pb-5 pt-8 px-2 animate-pulse">
                        {[30, 60, 45, 80, 50, 90].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary/10 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={{ stroke: "#f3e8ff" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}jt`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Pemasukan"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, fill: "#22c55e", stroke: "#fff", strokeWidth: 3 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Pengeluaran"
                                stroke="#a855f7"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#a855f7", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, fill: "#a855f7", stroke: "#fff", strokeWidth: 3 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Tabungan"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ r: 3, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
