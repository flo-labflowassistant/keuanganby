// === CORE ENTITY TYPES ===

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    totalPages: number;
    currentPage: number;
}

export interface IncomeSource {
    id: string;
    name: string;
    type: "fixed" | "variable";
    amount: number;
    month: number;
    year: number;
}

export interface Category {
    id: string;
    name: string;
    mainCategory: "Needs" | "Wants" | "Savings" | "Income";
    budget_allocation?: number;
    accountName?: string;
    isFixed?: boolean;
    icon?: string;
    description?: string;
}

export interface Budget {
    id: string;
    categoryId: string;
    allocation: number;
    month: number;
    year: number;
    category?: Category;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    categoryId: string;
    amount: number;
    accountName: string;
    isRecurring: boolean;
    category?: Category;
}

export interface Saving {
    id: string;
    name: string;
    accountName: string;
    amount: number;
    month: number;
    year: number;
}

export interface SavingGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    isAchieved: boolean;
    icon?: string;
}

export interface Reminder {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    categoryId?: string;
    amount?: number;
    isCompleted: boolean;
    isRecurring: boolean;
    recurrencePattern?: "monthly" | "weekly";
    category?: Category;
}

// === DASHBOARD / REPORT TYPES ===

export interface MonthlyData {
    month: number;
    year: number;
    income: number;
    expenses: number;
    savings: number;
}

export interface BudgetStatus {
    category: string;
    mainCategory: "Needs" | "Wants" | "Savings" | "Income";
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
}

export interface CategoryBreakdown {
    needs: number;
    wants: number;
    savings: number;
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
}

export interface DashboardSummary {
    totalIncome: number;
    totalSavings: number;
    totalExpenses: number;
    incomeTrend: number;
    savingsTrend: number;
    expensesTrend: number;
}

// === UI TYPES ===

export interface NavItem {
    label: string;
    icon: string;
    href: string;
    badge?: number;
}

export interface MonthYear {
    month: number;
    year: number;
}

export type MainCategory = "Needs" | "Wants" | "Savings" | "Income";
export type TransactionFilter = {
    search: string;
    categoryId: string | null;
    mainCategory: MainCategory | null;
    accountName: string | null;
    month: number;
    year: number;
    page: number;
    limit: number;
};
