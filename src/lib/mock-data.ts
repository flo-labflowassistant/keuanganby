import type {
    IncomeSource,
    Category,
    Budget,
    Transaction,
    Saving,
    SavingGoal,
    Reminder,
    MonthlyData,
    DashboardSummary,
    BudgetStatus,
} from "@/types";

// === INCOME SOURCES ===
export const mockIncomeSources: IncomeSource[] = [
    { id: "inc-1", name: "Gaji Utama", type: "fixed", amount: 12_000_000, month: 2, year: 2026 },
    { id: "inc-2", name: "Freelance Desain", type: "variable", amount: 3_500_000, month: 2, year: 2026 },
    { id: "inc-3", name: "Dividen Investasi", type: "variable", amount: 850_000, month: 2, year: 2026 },
];

// === CATEGORIES ===
export const mockCategories: Category[] = [
    { id: "cat-1", name: "Sewa & Utilitas", mainCategory: "Needs", accountName: "Bank Mandiri", isFixed: true, icon: "Home" },
    { id: "cat-2", name: "Belanja Harian", mainCategory: "Needs", accountName: "Cash", isFixed: false, icon: "ShoppingCart" },
    { id: "cat-3", name: "Transportasi", mainCategory: "Needs", accountName: "GoPay", isFixed: false, icon: "Car" },
    { id: "cat-4", name: "Internet & Telepon", mainCategory: "Needs", accountName: "Bank Mandiri", isFixed: true, icon: "Wifi" },
    { id: "cat-5", name: "Asuransi", mainCategory: "Needs", accountName: "Bank Mandiri", isFixed: true, icon: "Shield" },
    { id: "cat-6", name: "Hiburan", mainCategory: "Wants", accountName: "Cash", isFixed: false, icon: "Film" },
    { id: "cat-7", name: "Makan di Luar", mainCategory: "Wants", accountName: "BCA", isFixed: false, icon: "UtensilsCrossed" },
    { id: "cat-8", name: "Belanja", mainCategory: "Wants", accountName: "Credit Card", isFixed: false, icon: "ShoppingBag" },
    { id: "cat-9", name: "Perawatan Diri", mainCategory: "Wants", accountName: "Cash", isFixed: false, icon: "Heart" },
    { id: "cat-10", name: "Langganan", mainCategory: "Wants", accountName: "BCA", isFixed: true, icon: "CreditCard" },
    { id: "cat-11", name: "Dana Darurat", mainCategory: "Savings", accountName: "Bank Mandiri", isFixed: false, icon: "ShieldCheck" },
    { id: "cat-12", name: "Investasi", mainCategory: "Savings", accountName: "BCA", isFixed: false, icon: "TrendingUp" },
];

// === BUDGETS ===
export const mockBudgets: Budget[] = [
    { id: "bud-1", categoryId: "cat-1", allocation: 3_000_000, month: 2, year: 2026 },
    { id: "bud-2", categoryId: "cat-2", allocation: 1_500_000, month: 2, year: 2026 },
    { id: "bud-3", categoryId: "cat-3", allocation: 800_000, month: 2, year: 2026 },
    { id: "bud-4", categoryId: "cat-4", allocation: 350_000, month: 2, year: 2026 },
    { id: "bud-5", categoryId: "cat-5", allocation: 500_000, month: 2, year: 2026 },
    { id: "bud-6", categoryId: "cat-6", allocation: 600_000, month: 2, year: 2026 },
    { id: "bud-7", categoryId: "cat-7", allocation: 750_000, month: 2, year: 2026 },
    { id: "bud-8", categoryId: "cat-8", allocation: 500_000, month: 2, year: 2026 },
    { id: "bud-9", categoryId: "cat-9", allocation: 300_000, month: 2, year: 2026 },
    { id: "bud-10", categoryId: "cat-10", allocation: 250_000, month: 2, year: 2026 },
    { id: "bud-11", categoryId: "cat-11", allocation: 2_000_000, month: 2, year: 2026 },
    { id: "bud-12", categoryId: "cat-12", allocation: 1_500_000, month: 2, year: 2026 },
];

// === TRANSACTIONS ===
export const mockTransactions: Transaction[] = [
    { id: "txn-1", date: "2026-02-24", description: "Belanja Mingguan Supermarket", categoryId: "cat-2", amount: -325_000, accountName: "Cash", isRecurring: false },
    { id: "txn-2", date: "2026-02-23", description: "Netflix & Spotify", categoryId: "cat-10", amount: -199_000, accountName: "BCA", isRecurring: true },
    { id: "txn-3", date: "2026-02-22", description: "Makan Siang Tim Kantor", categoryId: "cat-7", amount: -185_000, accountName: "BCA", isRecurring: false },
    { id: "txn-4", date: "2026-02-21", description: "Grab ke Kantor (5 hari)", categoryId: "cat-3", amount: -175_000, accountName: "GoPay", isRecurring: false },
    { id: "txn-5", date: "2026-02-20", description: "Bayar Listrik & Air", categoryId: "cat-1", amount: -450_000, accountName: "Bank Mandiri", isRecurring: true },
    { id: "txn-6", date: "2026-02-19", description: "Beli Buku di Gramedia", categoryId: "cat-8", amount: -145_000, accountName: "Credit Card", isRecurring: false },
    { id: "txn-7", date: "2026-02-18", description: "Tiket Bioskop", categoryId: "cat-6", amount: -100_000, accountName: "Cash", isRecurring: false },
    { id: "txn-8", date: "2026-02-17", description: "Internet Indihome", categoryId: "cat-4", amount: -349_000, accountName: "Bank Mandiri", isRecurring: true },
    { id: "txn-9", date: "2026-02-16", description: "Kopi & Pastry Starbucks", categoryId: "cat-7", amount: -125_000, accountName: "GoPay", isRecurring: false },
    { id: "txn-10", date: "2026-02-15", description: "Skincare bulanan", categoryId: "cat-9", amount: -275_000, accountName: "Credit Card", isRecurring: false },
    { id: "txn-11", date: "2026-02-14", description: "Valentine Dinner", categoryId: "cat-7", amount: -450_000, accountName: "BCA", isRecurring: false },
    { id: "txn-12", date: "2026-02-13", description: "BPJS Kesehatan", categoryId: "cat-5", amount: -320_000, accountName: "Bank Mandiri", isRecurring: true },
    { id: "txn-13", date: "2026-02-12", description: "Belanja Mingguan", categoryId: "cat-2", amount: -290_000, accountName: "Cash", isRecurring: false },
    { id: "txn-14", date: "2026-02-11", description: "Grab & Gojek Seminggu", categoryId: "cat-3", amount: -160_000, accountName: "GoPay", isRecurring: false },
    { id: "txn-15", date: "2026-02-10", description: "Bayar Sewa Kos", categoryId: "cat-1", amount: -2_500_000, accountName: "Bank Mandiri", isRecurring: true },
    { id: "txn-16", date: "2026-02-09", description: "Nonton Konser Lokal", categoryId: "cat-6", amount: -350_000, accountName: "BCA", isRecurring: false },
    { id: "txn-17", date: "2026-02-08", description: "Beli Headphone TWS", categoryId: "cat-8", amount: -299_000, accountName: "Credit Card", isRecurring: false },
    { id: "txn-18", date: "2026-02-07", description: "Makan Siang Warteg", categoryId: "cat-7", amount: -75_000, accountName: "Cash", isRecurring: false },
    { id: "txn-19", date: "2026-02-06", description: "Belanja Mingguan", categoryId: "cat-2", amount: -310_000, accountName: "Cash", isRecurring: false },
    { id: "txn-20", date: "2026-02-05", description: "Top up Dana Darurat", categoryId: "cat-11", amount: -1_000_000, accountName: "Bank Mandiri", isRecurring: false },
    { id: "txn-21", date: "2026-02-04", description: "Investasi Reksadana", categoryId: "cat-12", amount: -750_000, accountName: "BCA", isRecurring: false },
    { id: "txn-22", date: "2026-02-03", description: "Nongkrong Cafe", categoryId: "cat-7", amount: -120_000, accountName: "GoPay", isRecurring: false },
    { id: "txn-23", date: "2026-02-02", description: "Sepatu Lari Nike", categoryId: "cat-8", amount: -899_000, accountName: "Credit Card", isRecurring: false },
    { id: "txn-24", date: "2026-02-01", description: "Bayar Asuransi Jiwa", categoryId: "cat-5", amount: -180_000, accountName: "Bank Mandiri", isRecurring: true },
    { id: "txn-25", date: "2026-02-01", description: "Belanja Awal Bulan", categoryId: "cat-2", amount: -425_000, accountName: "Cash", isRecurring: false },
];

// === SAVINGS ===
export const mockSavings: Saving[] = [
    { id: "sav-1", name: "Dana Darurat", accountName: "Bank Mandiri", amount: 2_000_000, month: 2, year: 2026 },
    { id: "sav-2", name: "Investasi Reksadana", accountName: "BCA", amount: 1_500_000, month: 2, year: 2026 },
];

// === SAVING GOALS ===
export const mockSavingGoals: SavingGoal[] = [
    { id: "goal-1", name: "Dana Darurat 6 Bulan", targetAmount: 72_000_000, currentAmount: 32_400_000, deadline: "2026-12-31", isAchieved: false, icon: "ShieldCheck" },
    { id: "goal-2", name: "Liburan Jepang", targetAmount: 25_000_000, currentAmount: 16_750_000, deadline: "2026-08-01", isAchieved: false, icon: "Plane" },
    { id: "goal-3", name: "Laptop Baru", targetAmount: 15_000_000, currentAmount: 2_250_000, deadline: "2026-06-15", isAchieved: false, icon: "Laptop" },
    { id: "goal-4", name: "Kursus Online UI/UX", targetAmount: 3_000_000, currentAmount: 3_000_000, deadline: "2026-03-01", isAchieved: true, icon: "GraduationCap" },
];

// === REMINDERS ===
export const mockReminders: Reminder[] = [
    { id: "rem-1", title: "Bayar Internet Indihome", dueDate: "2026-02-15", amount: 349_000, isCompleted: false, isRecurring: true, recurrencePattern: "monthly" },
    { id: "rem-2", title: "Bayar Asuransi Mobil", dueDate: "2026-02-10", amount: 2_500_000, isCompleted: false, isRecurring: false },
    { id: "rem-3", title: "Tagihan Telepon", dueDate: "2026-02-20", amount: 150_000, isCompleted: false, isRecurring: true, recurrencePattern: "monthly" },
    { id: "rem-4", title: "Bayar Kartu Kredit", dueDate: "2026-02-25", amount: 1_500_000, isCompleted: false, isRecurring: true, recurrencePattern: "monthly" },
    { id: "rem-5", title: "Bayar Sewa Kos", dueDate: "2026-03-01", amount: 2_500_000, isCompleted: false, isRecurring: true, recurrencePattern: "monthly" },
    { id: "rem-6", title: "Bayar Listrik & Air", description: "PLN + PAM", dueDate: "2026-02-05", amount: 450_000, isCompleted: true, isRecurring: true, recurrencePattern: "monthly" },
    { id: "rem-7", title: "BPJS Kesehatan", dueDate: "2026-02-13", amount: 320_000, isCompleted: true, isRecurring: true, recurrencePattern: "monthly" },
    { id: "rem-8", title: "Netflix & Spotify", dueDate: "2026-02-08", amount: 199_000, isCompleted: true, isRecurring: true, recurrencePattern: "monthly" },
];

// === MONTHLY TREND DATA (6 bulan terakhir) ===
export const mockMonthlyData: MonthlyData[] = [
    { month: 9, year: 2025, income: 14_500_000, expenses: 10_800_000, savings: 3_700_000 },
    { month: 10, year: 2025, income: 15_200_000, expenses: 11_350_000, savings: 3_850_000 },
    { month: 11, year: 2025, income: 16_000_000, expenses: 12_100_000, savings: 3_900_000 },
    { month: 12, year: 2025, income: 18_500_000, expenses: 14_200_000, savings: 4_300_000 },
    { month: 1, year: 2026, income: 15_800_000, expenses: 11_900_000, savings: 3_900_000 },
    { month: 2, year: 2026, income: 16_350_000, expenses: 12_050_000, savings: 4_300_000 },
];

// === DASHBOARD SUMMARY ===
export const mockDashboardSummary: DashboardSummary = {
    totalIncome: 16_350_000,
    totalSavings: 4_300_000,
    totalExpenses: 12_050_000,
    incomeTrend: 3.5,
    savingsTrend: 10.3,
    expensesTrend: 1.3,
};

// === BUDGET STATUS (current month) ===
export const mockBudgetStatus: BudgetStatus[] = [
    { category: "Kebutuhan (Needs)", mainCategory: "Needs", allocated: 6_150_000, spent: 5_735_000, remaining: 415_000, percentage: 93 },
    { category: "Keinginan (Wants)", mainCategory: "Wants", allocated: 2_400_000, spent: 2_023_000, remaining: 377_000, percentage: 84 },
    { category: "Tabungan (Savings)", mainCategory: "Savings", allocated: 3_500_000, spent: 3_500_000, remaining: 0, percentage: 100 },
];

// Helper to get category by id
export function getCategoryById(id: string): Category | undefined {
    return mockCategories.find((c) => c.id === id);
}

// Helper to enrich transactions with category data
export function getEnrichedTransactions(): (Transaction & { category: Category })[] {
    return mockTransactions
        .map((t) => {
            const category = getCategoryById(t.categoryId);
            if (!category) return null;
            return { ...t, category };
        })
        .filter(Boolean) as (Transaction & { category: Category })[];
}
