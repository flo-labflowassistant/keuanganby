import { supabase } from '@/lib/supabase';
import {
    Category,
    Transaction,
    SavingGoal,
    Reminder,
    DashboardSummary,
    BudgetStatus,
    MonthlyData,
    PaginatedResponse,
    TransactionFilter
} from '@/types';

// === DASHBOARD & ANALYTICS ===

export async function getDashboardSummary(month: number, year: number): Promise<DashboardSummary> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data: txns, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .gte('transaction_date', startDate)
        .lt('transaction_date', endDate);

    if (error) throw error;

    let income = 0;
    let expenses = 0;
    let savings = 0;

    // Filter "Income" by type='income'
    const incomeTxns = txns.filter(t => t.type === 'income');
    income = incomeTxns.reduce((sum, t) => sum + Number(t.amount), 0);

    // Add planned income from budget allocations based on month and year
    const { data: incomeBudgets } = await supabase
        .from('monthly_budgets')
        .select(`
            amount,
            categories!inner(main_category)
        `)
        .eq('month', month)
        .eq('year', year)
        .eq('categories.main_category', 'Income');

    if (incomeBudgets) {
        const plannedIncome = incomeBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
        income += plannedIncome;
    }

    // Get transfers to savings account (if any logic) or just expenses
    // Assuming transactions categorized as savings have category_id -> Savings
    // It's faster to just fetch everything with categories
    const { data: fullTxns } = await supabase
        .from('transactions')
        .select(`
            amount, type, category_id,
            category:categories(main_category)
        `)
        .gte('transaction_date', startDate)
        .lt('transaction_date', endDate);

    expenses = 0;
    savings = 0;

    if (fullTxns) {
        fullTxns.forEach(t => {
            if (t.type === 'expense') {
                const cat = Array.isArray(t.category) ? t.category[0] : t.category;
                if (cat?.main_category === 'Savings') {
                    savings += Number(t.amount);
                } else {
                    expenses += Number(t.amount);
                }
            }
        });
    }

    return {
        totalIncome: income,
        totalSavings: savings,
        totalExpenses: expenses,
        incomeTrend: 0, // Mock for now
        savingsTrend: 0,
        expensesTrend: 0,
    };
}

export async function getBudgetStatus(month: number, year: number): Promise<BudgetStatus[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

    if (catError) throw catError;

    const { data: budgets } = await supabase
        .from('monthly_budgets')
        .select('category_id, amount')
        .eq('month', month)
        .eq('year', year);

    const { data: txns, error: txError } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('type', 'expense')
        .gte('transaction_date', startDate)
        .lt('transaction_date', endDate);

    if (txError) throw txError;

    const result: Record<string, BudgetStatus> = {
        Needs: { category: "Kebutuhan (Needs)", mainCategory: "Needs", allocated: 0, spent: 0, remaining: 0, percentage: 0 },
        Wants: { category: "Keinginan (Wants)", mainCategory: "Wants", allocated: 0, spent: 0, remaining: 0, percentage: 0 },
        Savings: { category: "Tabungan (Savings)", mainCategory: "Savings", allocated: 0, spent: 0, remaining: 0, percentage: 0 },
    };

    categories.forEach(cat => {
        if (result[cat.main_category]) {
            const bg = budgets?.find(b => b.category_id === cat.id);
            result[cat.main_category].allocated += Number(bg?.amount || 0);
        }
    });

    txns.forEach(t => {
        const cat = categories.find(c => c.id === t.category_id);
        if (cat && result[cat.main_category]) {
            result[cat.main_category].spent += Number(t.amount);
        }
    });

    Object.values(result).forEach(st => {
        st.remaining = st.allocated - st.spent;
        st.percentage = st.allocated > 0 ? Math.min(Math.round((st.spent / st.allocated) * 100), 100) : 0;
    });

    return [result.Needs, result.Wants, result.Savings];
}

// === MONTHLY TREND ===

export async function getMonthlyTrend(currentMonth: number, currentYear: number): Promise<MonthlyData[]> {
    // Generate last 6 months dates
    const result: MonthlyData[] = [];

    // Calculate start date (6 months ago)
    let startMonth = currentMonth - 5;
    let startYear = currentYear;
    if (startMonth <= 0) {
        startMonth += 12;
        startYear -= 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data: txns, error } = await supabase
        .from('transactions')
        .select(`
            transaction_date, amount, type,
            category:categories(main_category)
        `)
        .gte('transaction_date', startDate)
        .lt('transaction_date', endDate);

    if (error) throw error;

    // Initialize the last 6 months in result array
    for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m <= 0) {
            m += 12;
            y -= 1;
        }
        result.push({ month: m, year: y, income: 0, expenses: 0, savings: 0 });
    }

    if (txns) {
        txns.forEach(t => {
            const date = new Date(t.transaction_date);
            const m = date.getMonth() + 1;
            const y = date.getFullYear();

            const monthData = result.find(r => r.month === m && r.year === y);
            if (monthData) {
                if (t.type === 'income') {
                    monthData.income += Number(t.amount);
                } else if (t.type === 'expense') {
                    const cat = Array.isArray(t.category) ? t.category[0] : t.category;
                    if (cat?.main_category === 'Savings') {
                        monthData.savings += Number(t.amount);
                    } else {
                        monthData.expenses += Number(t.amount);
                    }
                }
            }
        });
    }

    return result;
}

// === TRANSACTIONS ===

export async function getTransactions(month: number, year: number): Promise<Transaction[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            id, transaction_date, description, amount, type,
            category:categories (id, name, main_category, icon),
            account:accounts (name)
        `)
        .gte('transaction_date', startDate)
        .lt('transaction_date', endDate)
        .order('transaction_date', { ascending: false });

    if (error) throw error;

    return data.map(d => {
        const cat = Array.isArray(d.category) ? d.category[0] : d.category;
        const acc = Array.isArray(d.account) ? d.account[0] : d.account;

        // Amount is stored as positive, but conceptually expenses are negative in UI
        const amountDisplay = d.type === 'expense' ? -Number(d.amount) : Number(d.amount);

        return {
            id: d.id,
            date: d.transaction_date,
            description: d.description,
            categoryId: cat?.id || '',
            amount: amountDisplay,
            accountName: acc?.name || '',
            isRecurring: false,
            // @ts-ignore
            category: cat ? {
                id: cat.id,
                name: cat.name,
                mainCategory: cat.main_category,
                icon: cat.icon
            } : undefined
        };
    });
}

export async function getPaginatedTransactions(filter: TransactionFilter): Promise<PaginatedResponse<Transaction>> {
    const { month, year, page, limit, search, mainCategory, accountName } = filter;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('transactions')
        .select(`
            id, transaction_date, description, amount, type,
            category:categories!inner (id, name, main_category, icon),
            account:accounts (name)
        `, { count: 'exact' })
        .gte('transaction_date', startDate)
        .lt('transaction_date', endDate);

    if (search) {
        query = query.ilike('description', `%${search}%`);
    }

    if (mainCategory) {
        query = query.eq('categories.main_category', mainCategory);
    }

    if (accountName) {
        query = query.eq('accounts.name', accountName);
    }

    query = query.order('transaction_date', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    const formattedData = data.map(d => {
        const cat = Array.isArray(d.category) ? d.category[0] : d.category;
        const acc = Array.isArray(d.account) ? d.account[0] : d.account;
        const amountDisplay = d.type === 'expense' ? -Number(d.amount) : Number(d.amount);

        return {
            id: d.id,
            date: d.transaction_date,
            description: d.description,
            categoryId: cat?.id || '',
            amount: amountDisplay,
            accountName: acc?.name || '',
            isRecurring: false,
            // @ts-ignore
            category: cat ? {
                id: cat.id,
                name: cat.name,
                mainCategory: cat.main_category,
                icon: cat.icon
            } : undefined
        };
    });

    return {
        data: formattedData,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
    };
}

// === SAVING GOALS ===

export async function getSavingGoals(): Promise<SavingGoal[]> {
    const { data, error } = await supabase
        .from('saving_goals')
        .select('*')
        .order('deadline', { ascending: true });

    if (error) throw error;

    return data.map(d => ({
        id: d.id,
        name: d.name,
        targetAmount: Number(d.target_amount),
        currentAmount: Number(d.current_amount),
        deadline: d.deadline,
        isAchieved: Number(d.current_amount) >= Number(d.target_amount),
        icon: d.icon
    }));
}

export async function createSavingGoal(goal: Partial<SavingGoal>): Promise<void> {
    const { error } = await supabase.from('saving_goals').insert({
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount || 0,
        deadline: goal.deadline,
        icon: goal.icon || 'circle'
    });
    if (error) throw error;
}

export async function updateSavingGoalAmount(id: string, addedAmount: number, goalName: string): Promise<void> {
    // 1. Get current amount
    const { data: goal, error: fetchError } = await supabase
        .from('saving_goals')
        .select('current_amount')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    const newAmount = Number(goal.current_amount) + addedAmount;

    // 2. Update current amount
    const { error: updateError } = await supabase
        .from('saving_goals')
        .update({ current_amount: newAmount })
        .eq('id', id);

    if (updateError) throw updateError;

    // 3. Find "Savings" category ID for the transaction
    const { data: category, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('main_category', 'Savings')
        .limit(1)
        .single();

    if (catError) throw catError;

    // 4. Insert expense transaction for this savings allocation
    const { error: txtError } = await supabase
        .from('transactions')
        .insert({
            transaction_date: new Date().toISOString().split('T')[0],
            description: `Top-up: ${goalName}`,
            amount: addedAmount,
            type: 'expense',
            category_id: category.id,
        });

    if (txtError) throw txtError;
}

export async function deleteSavingGoal(id: string): Promise<void> {
    const { error } = await supabase.from('saving_goals').delete().eq('id', id);
    if (error) throw error;
}

// === REMINDERS ===

export async function getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('due_date', { ascending: true });

    if (error) throw error;

    return data.map(d => ({
        id: d.id,
        title: d.title,
        dueDate: d.due_date,
        amount: Number(d.amount),
        isCompleted: d.status === 'completed',
        isRecurring: d.is_recurring,
        recurrencePattern: "monthly",
    }));
}

export async function updateReminderStatus(id: string, isCompleted: boolean): Promise<void> {
    const { error } = await supabase
        .from('reminders')
        .update({ status: isCompleted ? 'completed' : 'upcoming' })
        .eq('id', id);

    if (error) throw error;
}

export async function createReminder(reminder: Partial<Reminder>): Promise<void> {
    const { error } = await supabase.from('reminders').insert({
        title: reminder.title,
        amount: reminder.amount ?? 0,
        due_date: reminder.dueDate,
        is_recurring: reminder.isRecurring || false,
        status: 'upcoming'
    });
    if (error) throw error;
}

export async function deleteReminder(id: string): Promise<void> {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) throw error;
}

// === CATEGORIES ===

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw error;

    return data.map(d => ({
        id: d.id,
        name: d.name,
        mainCategory: d.main_category as "Needs" | "Wants" | "Savings" | "Income",
        budget_allocation: d.budget_allocation ? Number(d.budget_allocation) : 0,
        accountName: '', // Legacy UI compatibility
        isFixed: false,
        icon: d.icon
    }));
}

// === MUTATIONS (CRUD) ===

export async function getMonthlyBudgets(month: number, year: number): Promise<{ categoryId: string, amount: number }[]> {
    const { data, error } = await supabase
        .from('monthly_budgets')
        .select('category_id, amount')
        .eq('month', month)
        .eq('year', year);

    if (error) throw error;

    return data.map(d => ({
        categoryId: d.category_id,
        amount: Number(d.amount)
    }));
}

export async function updateCategoryBudget(categoryId: string, allocation: number, month: number, year: number): Promise<void> {
    const { error } = await supabase.from('monthly_budgets').upsert({
        category_id: categoryId,
        month,
        year,
        amount: allocation
    }, { onConflict: 'category_id,month,year' });
    if (error) throw error;
}

export async function createTransaction(txn: Partial<Transaction>): Promise<void> {
    let account_id = null;
    if (txn.accountName) {
        const { data: acc } = await supabase
            .from('accounts')
            .select('id')
            .ilike('name', txn.accountName)
            .limit(1)
            .single();
        if (acc) {
            account_id = acc.id;
        }
    }

    const { error } = await supabase.from('transactions').insert({
        transaction_date: txn.date,
        description: txn.description,
        amount: Math.abs(txn.amount || 0),
        type: (txn.amount || 0) < 0 ? 'expense' : 'income',
        category_id: txn.categoryId,
        account_id: account_id
    });
    if (error) throw error;
}

export async function deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
}

