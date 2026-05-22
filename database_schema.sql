-- Personal financial tracker schema for local single-user Supabase.
-- This file represents the current application model.

DROP TABLE IF EXISTS monthly_budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS saving_goals;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS accounts;

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT DEFAULT 'Bank',
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    main_category TEXT NOT NULL CHECK (main_category IN ('Needs', 'Wants', 'Savings', 'Income')),
    icon TEXT DEFAULT 'circle',
    budget_allocation NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    transfer_group_id UUID,
    transfer_role TEXT CHECK (transfer_role IS NULL OR transfer_role IN ('source', 'destination')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_transactions_transfer_group_id
    ON transactions (transfer_group_id);

CREATE TABLE monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT monthly_budgets_category_month_year_key UNIQUE (category_id, month, year)
);

CREATE TABLE saving_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    deadline DATE,
    icon TEXT DEFAULT 'target',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saving_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read accounts" ON accounts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert accounts" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update accounts" ON accounts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete accounts" ON accounts FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update transactions" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete transactions" ON transactions FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read monthly_budgets" ON monthly_budgets FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert monthly_budgets" ON monthly_budgets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update monthly_budgets" ON monthly_budgets FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete monthly_budgets" ON monthly_budgets FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read saving_goals" ON saving_goals FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert saving_goals" ON saving_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update saving_goals" ON saving_goals FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete saving_goals" ON saving_goals FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read reminders" ON reminders FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert reminders" ON reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update reminders" ON reminders FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete reminders" ON reminders FOR DELETE USING (true);
