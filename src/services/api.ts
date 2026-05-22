import { supabase } from "@/lib/supabase";
import { formatDateInputValue, parseDateOnly } from "@/lib/utils";
import {
    Account,
    BudgetStatus,
    Category,
    DashboardSummary,
    MainCategory,
    MonthlyData,
    PaginatedResponse,
    Reminder,
    SavingGoal,
    SavingsOverview,
    Transaction,
    TransactionFilter,
} from "@/types";

const MAIN_ACCOUNT_NAME = "Kartu Utama";
const SAVINGS_ACCOUNT_NAME = "Kartu Tabungan";
const LEGACY_SAVINGS_CATEGORY = "General Savings";
const SAVINGS_CATEGORY_NAME = "Tabungan";

type TransactionType = "income" | "expense" | "transfer";
type TransferRole = "source" | "destination";

type CategoryRow = {
    id: string;
    name: string;
    main_category: MainCategory;
    icon?: string | null;
    budget_allocation?: number | string | null;
};

type AccountRow = {
    id: string;
    name: string;
    type: string;
    balance?: number | string | null;
};

type JoinedTransactionRow = {
    id: string;
    transaction_date: string;
    description: string;
    amount: number | string;
    type: TransactionType;
    category_id?: string | null;
    account_id?: string | null;
    category?: CategoryRow | CategoryRow[] | null;
    account?: Pick<AccountRow, "name"> | Pick<AccountRow, "name">[] | null;
    transfer_group_id?: string | null;
    transfer_role?: TransferRole | null;
};

type TransactionInsert = {
    transaction_date: string;
    description: string;
    amount: number;
    type: TransactionType;
    category_id?: string | null;
    account_id?: string | null;
    transfer_group_id?: string | null;
    transfer_role?: TransferRole | null;
};

function getMonthRange(month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    return { startDate, endDate };
}

function firstJoin<T>(value: T | T[] | null | undefined): T | undefined {
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
}

function displayCategoryName(name: string): string {
    return name === LEGACY_SAVINGS_CATEGORY ? SAVINGS_CATEGORY_NAME : name;
}

function mapCategory(row: CategoryRow): Category {
    return {
        id: row.id,
        name: displayCategoryName(row.name),
        mainCategory: row.main_category,
        budget_allocation: row.budget_allocation ? Number(row.budget_allocation) : 0,
        accountName: "",
        isFixed: false,
        icon: row.icon || (row.main_category === "Savings" ? "PiggyBank" : "circle"),
    };
}

function mapTransaction(row: JoinedTransactionRow): Transaction {
    const category = firstJoin(row.category);
    const account = firstJoin(row.account);
    const amount = Number(row.amount);

    return {
        id: row.id,
        date: row.transaction_date,
        description: row.description,
        categoryId: category?.id || row.category_id || "",
        amount: row.type === "expense" ? -amount : amount,
        accountName: account?.name || "",
        isRecurring: false,
        transferGroupId: row.transfer_group_id ?? null,
        transferRole: row.transfer_role ?? null,
        category: category ? mapCategory(category) : undefined,
    };
}

function isMissingTransferMetadataError(error: { code?: string; message?: string }) {
    const message = error.message || "";
    return (
        error.code === "42703" ||
        error.code === "PGRST204" ||
        message.includes("transfer_group_id") ||
        message.includes("transfer_role")
    );
}

function stripTransferMetadata(row: TransactionInsert): TransactionInsert {
    const cleanRow = { ...row };
    delete cleanRow.transfer_group_id;
    delete cleanRow.transfer_role;
    return cleanRow;
}

async function insertTransactions(rows: TransactionInsert[]): Promise<void> {
    const { error } = await supabase.from("transactions").insert(rows);
    if (!error) return;

    const hasTransferMetadata = rows.some((row) => row.transfer_group_id || row.transfer_role);
    if (hasTransferMetadata && isMissingTransferMetadataError(error)) {
        const fallbackRows = rows.map(stripTransferMetadata);
        const { error: fallbackError } = await supabase.from("transactions").insert(fallbackRows);
        if (fallbackError) throw fallbackError;
        return;
    }

    throw error;
}

async function fetchAccounts(): Promise<AccountRow[]> {
    const { data, error } = await supabase.from("accounts").select("*").order("name", { ascending: true });
    if (error) throw error;
    return data as AccountRow[];
}

async function fetchCategories(): Promise<CategoryRow[]> {
    const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
    if (error) throw error;
    return data as CategoryRow[];
}

async function fetchTransactionForDelete(id: string) {
    const withMetadata = await supabase
        .from("transactions")
        .select("description, amount, transaction_date, account_id, type, category_id, transfer_group_id, transfer_role")
        .eq("id", id)
        .single();

    if (!withMetadata.error) {
        return withMetadata.data as Pick<
            JoinedTransactionRow,
            "description" | "amount" | "transaction_date" | "account_id" | "type" | "category_id" | "transfer_group_id" | "transfer_role"
        >;
    }

    if (!isMissingTransferMetadataError(withMetadata.error)) {
        throw withMetadata.error;
    }

    const withoutMetadata = await supabase
        .from("transactions")
        .select("description, amount, transaction_date, account_id, type, category_id")
        .eq("id", id)
        .single();

    if (withoutMetadata.error) throw withoutMetadata.error;

    return {
        ...(withoutMetadata.data as Pick<
            JoinedTransactionRow,
            "description" | "amount" | "transaction_date" | "account_id" | "type" | "category_id"
        >),
        transfer_group_id: null,
        transfer_role: null,
    };
}

// === DASHBOARD & ANALYTICS ===

export async function getDashboardSummary(month: number, year: number): Promise<DashboardSummary> {
    const { startDate, endDate } = getMonthRange(month, year);

    const { data, error } = await supabase
        .from("transactions")
        .select(`
            amount, type,
            category:categories(main_category),
            account:accounts!inner(name)
        `)
        .eq("accounts.name", MAIN_ACCOUNT_NAME)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

    if (error) throw error;

    let income = 0;
    let operatingExpenses = 0;
    let savings = 0;

    (data as JoinedTransactionRow[]).forEach((txn) => {
        const amount = Number(txn.amount);
        const category = firstJoin(txn.category);

        if (txn.type === "income") {
            income += amount;
            return;
        }

        if (txn.type !== "expense") return;

        if (category?.main_category === "Savings") {
            savings += amount;
        } else {
            operatingExpenses += amount;
        }
    });

    return {
        totalIncome: income,
        totalSavings: savings,
        totalExpenses: operatingExpenses,
        incomeTrend: 0,
        savingsTrend: 0,
        expensesTrend: 0,
    };
}

export async function getBudgetStatus(month: number, year: number): Promise<BudgetStatus[]> {
    const { startDate, endDate } = getMonthRange(month, year);
    const categories = await fetchCategories();

    const { data: txns, error } = await supabase
        .from("transactions")
        .select("amount, type, category_id, account:accounts!inner(name)")
        .eq("accounts.name", MAIN_ACCOUNT_NAME)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

    if (error) throw error;

    const totalIncome = (txns as JoinedTransactionRow[])
        .filter((txn) => txn.type === "income")
        .reduce((sum, txn) => sum + Number(txn.amount), 0);

    const result: Record<"Needs" | "Wants" | "Savings", BudgetStatus> = {
        Needs: {
            category: "Kebutuhan",
            mainCategory: "Needs",
            allocated: totalIncome,
            spent: 0,
            remaining: totalIncome,
            percentage: 0,
        },
        Wants: {
            category: "Keinginan",
            mainCategory: "Wants",
            allocated: totalIncome,
            spent: 0,
            remaining: totalIncome,
            percentage: 0,
        },
        Savings: {
            category: SAVINGS_CATEGORY_NAME,
            mainCategory: "Savings",
            allocated: totalIncome,
            spent: 0,
            remaining: totalIncome,
            percentage: 0,
        },
    };

    (txns as JoinedTransactionRow[]).forEach((txn) => {
        if (txn.type !== "expense") return;
        const category = categories.find((cat) => cat.id === txn.category_id);
        if (category?.main_category === "Needs" || category?.main_category === "Wants" || category?.main_category === "Savings") {
            result[category.main_category].spent += Number(txn.amount);
        }
    });

    Object.values(result).forEach((status) => {
        status.remaining = status.allocated - status.spent;
        status.percentage = status.allocated > 0 ? Math.round((status.spent / status.allocated) * 100) : 0;
    });

    return [result.Needs, result.Wants, result.Savings];
}

export async function getMonthlyTrend(currentMonth: number, currentYear: number): Promise<MonthlyData[]> {
    const result: MonthlyData[] = [];
    let startMonth = currentMonth - 5;
    let startYear = currentYear;

    if (startMonth <= 0) {
        startMonth += 12;
        startYear -= 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, "0")}-01`;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    const { data, error } = await supabase
        .from("transactions")
        .select(`
            transaction_date, amount, type,
            category:categories(main_category),
            account:accounts!inner(name)
        `)
        .eq("accounts.name", MAIN_ACCOUNT_NAME)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

    if (error) throw error;

    for (let i = 5; i >= 0; i--) {
        let month = currentMonth - i;
        let year = currentYear;
        if (month <= 0) {
            month += 12;
            year -= 1;
        }
        result.push({ month, year, income: 0, expenses: 0, savings: 0 });
    }

    (data as JoinedTransactionRow[]).forEach((txn) => {
        const date = parseDateOnly(txn.transaction_date);
        const monthData = result.find((item) => item.month === date.getMonth() + 1 && item.year === date.getFullYear());
        if (!monthData) return;

        const amount = Number(txn.amount);
        const category = firstJoin(txn.category);

        if (txn.type === "income") {
            monthData.income += amount;
        } else if (txn.type === "expense" && category?.main_category === "Savings") {
            monthData.savings += amount;
        } else if (txn.type === "expense") {
            monthData.expenses += amount;
        }
    });

    return result;
}

// === TRANSACTIONS ===

export async function getTransactions(month: number, year: number, accountName?: string): Promise<Transaction[]> {
    const { startDate, endDate } = getMonthRange(month, year);

    let query = supabase
        .from("transactions")
        .select(`
            id, transaction_date, description, amount, type,
            category_id, account_id,
            category:categories(id, name, main_category, icon),
            account:accounts!inner(name)
        `)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

    if (accountName) {
        query = query.eq("accounts.name", accountName);
    }

    const { data, error } = await query.order("transaction_date", { ascending: false });
    if (error) throw error;

    return (data as JoinedTransactionRow[]).map(mapTransaction);
}

export async function getPaginatedTransactions(filter: TransactionFilter): Promise<PaginatedResponse<Transaction>> {
    const { month, year, page, limit, search, mainCategory, categoryId, accountName } = filter;
    const { startDate, endDate } = getMonthRange(month, year);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from("transactions")
        .select(`
            id, transaction_date, description, amount, type,
            category_id, account_id,
            category:categories!inner(id, name, main_category, icon),
            account:accounts!inner(name)
        `, { count: "exact" })
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

    if (search) {
        query = query.ilike("description", `%${search}%`);
    }

    if (categoryId) {
        query = query.eq("category_id", categoryId);
    }

    if (mainCategory) {
        query = query.eq("categories.main_category", mainCategory);
    }

    if (accountName) {
        query = query.eq("accounts.name", accountName);
    }

    const { data, count, error } = await query.order("transaction_date", { ascending: false }).range(from, to);
    if (error) throw error;

    return {
        data: (data as JoinedTransactionRow[]).map(mapTransaction),
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page,
    };
}

// === SAVINGS ===

export async function getSavingsOverview(month: number, year: number): Promise<SavingsOverview> {
    const [accounts, transactions] = await Promise.all([
        getAccounts(),
        getTransactions(month, year, SAVINGS_ACCOUNT_NAME),
    ]);

    const savingsAccount = accounts.find((account) => account.name === SAVINGS_ACCOUNT_NAME);
    const inflowTransactions = transactions.filter((txn) => txn.amount > 0);
    const outflowTransactions = transactions.filter((txn) => txn.amount < 0);
    const monthlyInflow = inflowTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const monthlyOutflow = outflowTransactions.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

    return {
        balance: savingsAccount?.balance || 0,
        monthlyInflow,
        monthlyOutflow,
        monthlyNet: monthlyInflow - monthlyOutflow,
        inflowTransactions,
        outflowTransactions,
    };
}

// === SAVING GOALS ===

export async function getSavingGoals(): Promise<SavingGoal[]> {
    const { data, error } = await supabase.from("saving_goals").select("*").order("deadline", { ascending: true });
    if (error) throw error;

    return data.map((goal) => ({
        id: goal.id,
        name: goal.name,
        targetAmount: Number(goal.target_amount),
        currentAmount: Number(goal.current_amount),
        deadline: goal.deadline,
        isAchieved: Number(goal.current_amount) >= Number(goal.target_amount),
        icon: goal.icon,
    }));
}

export async function createSavingGoal(goal: Partial<SavingGoal>): Promise<void> {
    const { error } = await supabase.from("saving_goals").insert({
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount || 0,
        deadline: goal.deadline,
        icon: goal.icon || "Target",
    });
    if (error) throw error;
}

export async function updateSavingGoalAmount(id: string, addedAmount: number, goalName: string): Promise<void> {
    const { data: goal, error: fetchError } = await supabase
        .from("saving_goals")
        .select("current_amount")
        .eq("id", id)
        .single();

    if (fetchError) throw fetchError;

    const newAmount = Number(goal.current_amount) + addedAmount;
    const { error: updateError } = await supabase
        .from("saving_goals")
        .update({ current_amount: newAmount })
        .eq("id", id);

    if (updateError) throw updateError;

    const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("main_category", "Savings")
        .limit(1)
        .single();

    if (categoryError) throw categoryError;

    await createTransaction({
        date: formatDateInputValue(),
        description: `Menabung: ${goalName}`,
        amount: -addedAmount,
        categoryId: category.id,
        accountName: MAIN_ACCOUNT_NAME,
        isRecurring: false,
    });
}

export async function deleteSavingGoal(id: string): Promise<void> {
    const { error } = await supabase.from("saving_goals").delete().eq("id", id);
    if (error) throw error;
}

// === REMINDERS ===

export async function getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase.from("reminders").select("*").order("due_date", { ascending: true });
    if (error) throw error;

    return data.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        dueDate: reminder.due_date,
        amount: Number(reminder.amount),
        isCompleted: reminder.status === "completed",
        isRecurring: reminder.is_recurring,
        recurrencePattern: "monthly",
    }));
}

export async function updateReminderStatus(id: string, isCompleted: boolean): Promise<void> {
    const { error } = await supabase
        .from("reminders")
        .update({ status: isCompleted ? "completed" : "upcoming" })
        .eq("id", id);

    if (error) throw error;
}

export async function createReminder(reminder: Partial<Reminder>): Promise<void> {
    const { error } = await supabase.from("reminders").insert({
        title: reminder.title,
        amount: reminder.amount ?? 0,
        due_date: reminder.dueDate,
        is_recurring: reminder.isRecurring || false,
        status: "upcoming",
    });
    if (error) throw error;
}

export async function deleteReminder(id: string): Promise<void> {
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) throw error;
}

// === CATEGORIES & ACCOUNTS ===

export async function getCategories(): Promise<Category[]> {
    const categories = await fetchCategories();
    return categories.map(mapCategory);
}

export async function getAccounts(): Promise<Account[]> {
    const accounts = await fetchAccounts();
    const { data: txns, error } = await supabase.from("transactions").select("account_id, amount, type");
    if (error) throw error;

    return accounts.map((account) => {
        const balance = txns
            .filter((txn) => txn.account_id === account.id)
            .reduce((sum, txn) => {
                const amount = Number(txn.amount);
                return txn.type === "income" ? sum + amount : sum - amount;
            }, 0);

        return {
            id: account.id,
            name: account.name,
            type: account.type,
            balance,
        };
    });
}

// === MUTATIONS (CRUD) ===

export async function getMonthlyBudgets(month: number, year: number): Promise<{ categoryId: string; amount: number }[]> {
    const { data, error } = await supabase
        .from("monthly_budgets")
        .select("category_id, amount")
        .eq("month", month)
        .eq("year", year);

    if (error) throw error;

    return data.map((budget) => ({
        categoryId: budget.category_id,
        amount: Number(budget.amount),
    }));
}

export async function updateCategoryBudget(categoryId: string, allocation: number, month: number, year: number): Promise<void> {
    const { error } = await supabase.from("monthly_budgets").upsert({
        category_id: categoryId,
        month,
        year,
        amount: allocation,
    }, { onConflict: "category_id,month,year" });
    if (error) throw error;
}

export async function createTransaction(txn: Partial<Transaction>): Promise<void> {
    if (!txn.date || !txn.description || !txn.categoryId) {
        throw new Error("Tanggal, deskripsi, dan kategori wajib diisi.");
    }

    const finalAmount = Math.abs(txn.amount || 0);
    const finalType: TransactionType = (txn.amount || 0) < 0 ? "expense" : "income";

    const requestedAccountName = txn.accountName?.trim() || MAIN_ACCOUNT_NAME;
    const [accounts, categories] = await Promise.all([fetchAccounts(), fetchCategories()]);
    const sourceAccount = accounts.find((account) => account.name.toLowerCase() === requestedAccountName.toLowerCase());
    const savingsAccount = accounts.find((account) => account.name === SAVINGS_ACCOUNT_NAME);
    const category = categories.find((item) => item.id === txn.categoryId);

    if (!sourceAccount) {
        throw new Error("Akun sumber dana tidak ditemukan.");
    }

    const isSavingsTransfer =
        finalType === "expense" &&
        category?.main_category === "Savings" &&
        sourceAccount.name === MAIN_ACCOUNT_NAME;

    if (isSavingsTransfer) {
        if (!savingsAccount) {
            throw new Error("Akun Kartu Tabungan tidak ditemukan.");
        }

        const transferGroupId = globalThis.crypto.randomUUID();
        await insertTransactions([
            {
                transaction_date: txn.date,
                description: txn.description,
                amount: finalAmount,
                type: "expense",
                category_id: txn.categoryId,
                account_id: sourceAccount.id,
                transfer_group_id: transferGroupId,
                transfer_role: "source",
            },
            {
                transaction_date: txn.date,
                description: `${SAVINGS_CATEGORY_NAME}: ${txn.description}`,
                amount: finalAmount,
                type: "income",
                category_id: txn.categoryId,
                account_id: savingsAccount.id,
                transfer_group_id: transferGroupId,
                transfer_role: "destination",
            },
        ]);
        return;
    }

    await insertTransactions([
        {
            transaction_date: txn.date,
            description: txn.description,
            amount: finalAmount,
            type: finalType,
            category_id: txn.categoryId,
            account_id: sourceAccount.id,
        },
    ]);
}

export async function deleteTransaction(id: string): Promise<void> {
    const txn = await fetchTransactionForDelete(id);

    if (txn.transfer_group_id) {
        const { error } = await supabase.from("transactions").delete().eq("transfer_group_id", txn.transfer_group_id);
        if (error) throw error;
        return;
    }

    const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("main_category")
        .eq("id", txn.category_id)
        .single();

    if (categoryError) throw categoryError;

    if (category?.main_category === "Savings" && txn.type === "expense") {
        await supabase
            .from("transactions")
            .delete()
            .eq("description", `${SAVINGS_CATEGORY_NAME}: ${txn.description}`)
            .eq("amount", txn.amount)
            .eq("transaction_date", txn.transaction_date)
            .eq("type", "income");
    }

    if (category?.main_category === "Savings" && txn.type === "income" && txn.description.startsWith(`${SAVINGS_CATEGORY_NAME}: `)) {
        const sourceDescription = txn.description.replace(`${SAVINGS_CATEGORY_NAME}: `, "");
        await supabase
            .from("transactions")
            .delete()
            .eq("description", sourceDescription)
            .eq("amount", txn.amount)
            .eq("transaction_date", txn.transaction_date)
            .eq("type", "expense");
    }

    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
}
