import { IncomeSourcesForm } from "@/components/budget/income-sources-form";
import { SavingsTargetsForm } from "@/components/budget/savings-targets-form";
import { BudgetSummaryBar } from "@/components/budget/budget-summary-bar";
import { BudgetAllocation } from "@/components/budget/budget-allocation";

export default function BudgetPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Pengaturan Anggaran 📋
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Kelola anggaran bulananmu dengan aturan 50/30/20
                </p>
            </div>

            {/* Summary Bar */}
            <BudgetSummaryBar />

            {/* Income & Savings Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <IncomeSourcesForm />
                <SavingsTargetsForm />
            </div>

            {/* Budget Allocation */}
            <BudgetAllocation />
        </div>
    );
}
