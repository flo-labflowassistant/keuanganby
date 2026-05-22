import { BudgetSummaryBar } from "@/components/budget/budget-summary-bar";
import { BudgetAllocation } from "@/components/budget/budget-allocation";

export default function BudgetPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Tracking Pengeluaran 📊
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Pantau arus kas dan pengeluaran aktual bulan ini
                </p>
            </div>

            {/* Summary Bar */}
            <BudgetSummaryBar />

            {/* Spending Tracker */}
            <BudgetAllocation />
        </div>
    );
}
