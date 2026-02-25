import { SummaryCards } from "@/components/dashboard/summary-cards";
import { BudgetUsage } from "@/components/dashboard/budget-usage";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Greeting */}
            <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-1">
                    Haii Kamelll<span className="text-2xl leading-none">💜</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Ini ringkasan keuanganmu bulan ini
                </p>
            </div>

            {/* Summary Cards */}
            <SummaryCards />

            {/* Charts & Budget Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <MonthlyTrendChart />
                </div>
                <div className="lg:col-span-2">
                    <BudgetUsage />
                </div>
            </div>

            {/* Recent Transactions */}
            <RecentTransactions />
        </div>
    );
}
