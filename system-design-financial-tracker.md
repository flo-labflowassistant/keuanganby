# 📊 System Design Document: Personal Financial Tracker

## Executive Summary

Dokumen ini merancang sistem aplikasi **Personal Financial Tracker** yang mereplikasi dan meningkatkan fungsionalitas dari Excel tracker yang sudah ada. Aplikasi ini akan dibangun menggunakan **Next.js 14+ (App Router)**, **React**, **Tailwind CSS**, **shadcn/ui**, dengan database **Supabase (PostgreSQL)** dan di-deploy di **Vercel**.

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Web App       │  │  Mobile App     │  │  PWA (Optional)         │  │
│  │   (Next.js)     │  │  (Responsive)   │  │  (Offline Support)      │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
└───────────┼────────────────────┼────────────────────────┼───────────────┘
            │                    │                        │
            └────────────────────┴────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API LAYER         │
                    │   Next.js API       │
                    │   Routes (Edge)     │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐
    │  Supabase    │  │  Supabase       │  │  Vercel    │
    │  PostgreSQL  │  │  Auth           │  │  Cron      │
    │  (Database)  │  │  (Auth)         │  │  (Backup)  │
    └──────────────┘  └─────────────────┘  └────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14+ (App Router) | React framework dengan SSR/SSG |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS + UI components |
| **State Management** | Zustand + React Query | Global state & server state |
| **Database** | Supabase (PostgreSQL) | Primary database |
| **Auth** | Supabase Auth | User authentication |
| **Storage** | Supabase Storage | File storage (Excel imports) |
| **Hosting** | Vercel | Deployment & serverless functions |
| **Cron Jobs** | Vercel Cron | Monthly backup automation |
| **Charts** | Recharts | Data visualization |
| **Excel Processing** | SheetJS (xlsx) | Import/export Excel files |

---

## 2. Database Schema (Supabase PostgreSQL)

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│     users       │       │  income_sources  │       │    savings      │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ id (PK)          │       │ id (PK)         │
│ email           │       │ user_id (FK)     │       │ user_id (FK)    │
│ created_at      │       │ name             │       │ name            │
│ updated_at      │       │ type             │       │ account_name    │
└─────────────────┘       │ amount           │       │ target_amount   │
                          │ month            │       │ current_amount  │
                          │ year             │       │ month           │
                          │ year             │       │ year            │
                          └──────────────────┘       └─────────────────┘
                                    │
                                    │
┌─────────────────┐       ┌─────────▼──────────┐      ┌─────────────────┐
│   categories    │       │   transactions     │      │   budgets       │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ id (PK)          │       │ id (PK)         │
│ user_id (FK)    │       │ user_id (FK)     │       │ user_id (FK)    │
│ name            │       │ category_id (FK) │◄──────┤ category_id (FK)│
│ type            │       │ description      │       │ allocation      │
│ main_category   │       │ amount           │       │ month           │
│ account_name    │       │ date             │       │ year            │
│ is_fixed        │       │ account_name     │       └─────────────────┘
└─────────────────┘       │ is_recurring     │
                          │ created_at       │
                          └──────────────────┘
                                    │
                                    │
                          ┌─────────▼──────────┐
                          │  saving_goals      │
                          ├──────────────────┤
                          │ id (PK)          │
                          │ user_id (FK)     │
                          │ name             │
                          │ target_amount    │
                          │ current_amount   │
                          │ deadline         │
                          │ is_achieved      │
                          └──────────────────┘
```

### 2.2 Detailed Table Schema

#### 2.2.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);
```

#### 2.2.2 Income Sources Table
```sql
CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Monthly Salary", "Freelance"
    type VARCHAR(50) NOT NULL, -- "fixed", "variable"
    amount DECIMAL(15, 2) NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name, month, year)
);
```

#### 2.2.3 Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Kos", "Makanan", "Skincare"
    main_category VARCHAR(50) NOT NULL, -- "Needs", "Wants", "Savings"
    account_name VARCHAR(100) NOT NULL, -- "Bank Mandiri", "Bank Mandiri 2"
    is_fixed BOOLEAN DEFAULT FALSE, -- For recurring categories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);
```

#### 2.2.4 Budgets Table
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    allocation DECIMAL(15, 2) NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id, month, year)
);
```

#### 2.2.5 Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
```

#### 2.2.6 Savings Table
```sql
CREATE TABLE savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "General Savings", "Emergency"
    account_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name, month, year)
);
```

#### 2.2.7 Saving Goals Table
```sql
CREATE TABLE saving_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    deadline DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.2.8 Reminders Table
```sql
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2),
    is_completed BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- "monthly", "weekly"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saving_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Example policy for transactions
CREATE POLICY "Users can only access their own transactions"
    ON transactions FOR ALL
    USING (auth.uid() = user_id);
```

---

## 3. Application Flow & Business Logic

### 3.1 Core Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   Landing    │
    │    Page      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐     ┌──────────────┐
    │    Login     │────►│   Dashboard  │
    │   (Supabase) │     │   (Overview) │
    └──────────────┘     └──────┬───────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │   Monthly    │    │  Spending    │    │   Budget     │
    │   Budget     │    │   Tracker    │    │   Goals      │
    │   Setup      │    │  (Add/Edit)  │    │   & Reports  │
    └──────────────┘    └──────────────┘    └──────────────┘
```

### 3.2 Monthly Budget Cycle Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MONTHLY BUDGET CYCLE                                 │
└─────────────────────────────────────────────────────────────────────────┘

Month Start
    │
    ▼
┌─────────────────┐
│ 1. Set Income   │◄────────────────────────────────────────┐
│    Sources      │                                         │
└────────┬────────┘                                         │
         │                                                   │
         ▼                                                   │
┌─────────────────┐                                          │
│ 2. Set Savings  │                                          │
│    Targets      │                                          │
└────────┬────────┘                                          │
         │                                                   │
         ▼                                                   │
┌─────────────────┐     ┌─────────────────┐                 │
│ 3. Allocate     │────►│ Budget = Income │                 │
│    Budgets      │     │    - Savings    │                 │
└────────┬────────┘     └─────────────────┘                 │
         │                                                   │
         ▼                                                   │
┌─────────────────┐                                          │
│ 4. Daily Track  │                                          │
│    Spending     │                                          │
└────────┬────────┘                                          │
         │                                                   │
         ▼                                                   │
┌─────────────────┐     ┌─────────────────┐                 │
│ 5. Monitor      │────►│ Overspend?      │────► Adjust ────┤
│    Progress     │     │ Underspend?     │     Budget      │
└─────────────────┘     └─────────────────┘                 │
         │                                                   │
         ▼                                                   │
┌─────────────────┐                                          │
│ 6. Month End    │──────────────────────────────────────────┘
│    Review       │
└─────────────────┘
```

### 3.3 Transaction Recording Flow

```
User Input Transaction
         │
         ▼
┌─────────────────────────┐
│ Validate Input          │
│ - Amount > 0            │
│ - Date valid            │
│ - Category exists       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Check Budget Status     │
│ Get current spending    │
│ for category            │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Budget > 80%? │
    └───────┬───────┘
            │
      ┌─────┴─────┐
      │           │
     Yes         No
      │           │
      ▼           ▼
┌──────────┐  ┌──────────┐
│ Show     │  │ Save     │
│ Warning  │  │ Transaction
│ "Budget  │  │          │
│  almost  │  │          │
│  full"   │  │          │
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            │
            ▼
┌─────────────────────────┐
│ Update Dashboard        │
│ - Recalculate totals    │
│ - Update charts         │
│ - Check reminders       │
└─────────────────────────┘
```

### 3.4 Excel Import Flow

```
User Uploads Excel
         │
         ▼
┌─────────────────────────┐
│ Parse Excel File        │
│ (SheetJS)               │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Detect Sheet Type       │
│ - Monthly Budget        │
│ - Spending Tracker      │
│ - Dashboard             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Validate Data           │
│ - Check required fields │
│ - Validate amounts      │
│ - Check date formats    │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Valid Data?   │
    └───────┬───────┘
            │
      ┌─────┴─────┐
      │           │
     Yes         No
      │           │
      ▼           ▼
┌──────────┐  ┌──────────┐
│ Import   │  │ Show     │
│ to DB    │  │ Errors   │
│          │  │ List     │
└────┬─────┘  └──────────┘
     │
     ▼
┌─────────────────────────┐
│ Show Import Summary     │
│ - Records imported      │
│ - Records skipped       │
│ - Total amounts         │
└─────────────────────────┘
```

### 3.5 Reminder System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REMINDER SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────────┘

Daily Cron Job (Vercel Cron)
         │
         ▼
┌─────────────────────────┐
│ Check Due Reminders     │
│ - Due today             │
│ - Overdue               │
│ - Upcoming (3 days)     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Send Notifications      │
│ - In-app badge          │
│ - Email (optional)      │
│ - Push notification     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ User Action             │
│ - Mark as paid          │
│ - Snooze                │
│ - Dismiss               │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ If Marked as Paid       │
│ - Auto-create           │
│   transaction           │
│ - Update budget         │
└─────────────────────────┘
```

---

## 4. API Design (Next.js API Routes)

### 4.1 API Structure

```
/app/api/
├── auth/
│   └── [...nextauth]/route.ts      # Authentication handlers
├── income/
│   ├── route.ts                    # GET, POST income sources
│   └── [id]/route.ts               # GET, PUT, DELETE specific income
├── categories/
│   ├── route.ts                    # GET, POST categories
│   └── [id]/route.ts               # GET, PUT, DELETE specific category
├── budgets/
│   ├── route.ts                    # GET, POST budgets
│   └── [id]/route.ts               # GET, PUT, DELETE specific budget
├── transactions/
│   ├── route.ts                    # GET, POST transactions
│   ├── [id]/route.ts               # GET, PUT, DELETE specific transaction
│   └── summary/route.ts            # GET transaction summaries
├── savings/
│   ├── route.ts                    # GET, POST savings
│   └── [id]/route.ts               # GET, PUT, DELETE specific saving
├── goals/
│   ├── route.ts                    # GET, POST saving goals
│   └── [id]/route.ts               # GET, PUT, DELETE specific goal
├── reminders/
│   ├── route.ts                    # GET, POST reminders
│   └── [id]/route.ts               # GET, PUT, DELETE specific reminder
├── reports/
│   ├── monthly/route.ts            # GET monthly report
│   ├── yearly/route.ts             # GET yearly comparison
│   └── forecast/route.ts           # GET budget forecast
├── import/
│   └── excel/route.ts              # POST import from Excel
└── export/
    └── excel/route.ts              # GET export to Excel
```

### 4.2 Key API Endpoints

#### 4.2.1 Get Monthly Dashboard
```typescript
// GET /api/reports/monthly?month=2&year=2026

Response: {
  month: number;
  year: number;
  income: {
    total: number;
    sources: Array<{
      name: string;
      amount: number;
    }>;
  };
  savings: {
    total: number;
    items: Array<{
      name: string;
      account: string;
      amount: number;
    }>;
  };
  expenses: {
    total: number;
    byCategory: Array<{
      category: string;
      mainCategory: string;
      allocation: number;
      realization: number;
      percentage: number;
    }>;
  };
  allocatedMoney: number;
  nonAllocatedMoney: number;
  usagePercentage: number;
}
```

#### 4.2.2 Add Transaction
```typescript
// POST /api/transactions

Request: {
  categoryId: string;
  description: string;
  amount: number;
  date: string; // ISO date
  accountName: string;
}

Response: {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  accountName: string;
  createdAt: string;
  // Include updated budget status
  budgetStatus: {
    category: string;
    spent: number;
    allocated: number;
    remaining: number;
    percentage: number;
  };
}
```

#### 4.2.3 Get Yearly Comparison
```typescript
// GET /api/reports/yearly?year=2026

Response: {
  year: number;
  monthlyData: Array<{
    month: number;
    monthName: string;
    income: number;
    expenses: number;
    savings: number;
    budgetUsage: number;
  }>;
  totals: {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    averageBudgetUsage: number;
  };
  trends: {
    incomeTrend: number; // percentage change
    expenseTrend: number;
    savingsTrend: number;
  };
}
```

#### 4.2.4 Get Budget Forecast
```typescript
// GET /api/reports/forecast?months=3

Response: {
  currentMonth: {
    month: number;
    projectedExpenses: number;
    projectedSavings: number;
  };
  forecast: Array<{
    month: number;
    monthName: string;
    predictedIncome: number;
    predictedExpenses: number;
    predictedSavings: number;
    confidence: number; // 0-1
  }>;
  recommendations: Array<{
    type: string;
    message: string;
    potentialSavings: number;
  }>;
}
```

#### 4.2.5 Import Excel
```typescript
// POST /api/import/excel

Request: {
  file: File; // multipart/form-data
  options: {
    skipInvalidRows: boolean;
    overwriteExisting: boolean;
  };
}

Response: {
  success: boolean;
  imported: {
    incomeSources: number;
    categories: number;
    budgets: number;
    transactions: number;
    savings: number;
  };
  errors: Array<{
    row: number;
    sheet: string;
    message: string;
  }>;
  warnings: Array<{
    message: string;
  }>;
}
```

---

## 5. Frontend Structure

### 5.1 Page Structure (Next.js App Router)

```
/app
├── (auth)/
│   ├── login/page.tsx              # Login page
│   └── layout.tsx                  # Auth layout
├── (dashboard)/
│   ├── layout.tsx                  # Main dashboard layout
│   ├── page.tsx                    # Dashboard overview
│   ├── budget/
│   │   └── page.tsx                # Monthly budget setup
│   ├── transactions/
│   │   └── page.tsx                # Spending tracker
│   ├── savings/
│   │   └── page.tsx                # Savings & goals
│   ├── reports/
│   │   └── page.tsx                # Reports & analytics
│   ├── reminders/
│   │   └── page.tsx                # Reminders management
│   └── settings/
│       └── page.tsx                # User settings
├── api/                            # API routes
├── layout.tsx                      # Root layout
└── globals.css                     # Global styles
```

### 5.2 Component Structure

```
/components/
├── ui/                             # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   └── ...
├── layout/
│   ├── sidebar.tsx                 # Navigation sidebar
│   ├── header.tsx                  # Top header
│   └── mobile-nav.tsx              # Mobile navigation
├── dashboard/
│   ├── summary-cards.tsx           # Income, savings, expenses cards
│   ├── budget-progress.tsx         # Budget usage progress bars
│   ├── recent-transactions.tsx     # Recent transactions list
│   └── monthly-chart.tsx           # Monthly trend chart
├── budget/
│   ├── budget-form.tsx             # Budget allocation form
│   ├── income-form.tsx             # Income sources form
│   ├── savings-form.tsx            # Savings form
│   └── category-budget-item.tsx    # Individual category budget
├── transactions/
│   ├── transaction-form.tsx        # Add/edit transaction form
│   ├── transaction-list.tsx        # Transaction list with filters
│   ├── transaction-filters.tsx     # Filter controls
│   └── transaction-item.tsx        # Individual transaction row
├── reports/
│   ├── monthly-report.tsx          # Monthly report view
│   ├── yearly-comparison.tsx       # Yearly comparison chart
│   ├── budget-forecast.tsx         # Budget forecast view
│   └── category-breakdown.tsx      # Category breakdown chart
├── savings/
│   ├── saving-goals-list.tsx       # Saving goals list
│   ├── goal-progress.tsx           # Goal progress component
│   └── add-goal-form.tsx           # Add goal form
├── reminders/
│   ├── reminder-list.tsx           # Reminders list
│   ├── reminder-form.tsx           # Add/edit reminder form
│   └── reminder-card.tsx           # Reminder card component
├── import-export/
│   ├── excel-import.tsx            # Excel import component
│   └── excel-export.tsx            # Excel export component
└── shared/
    ├── currency-input.tsx          # Currency input component
    ├── month-year-picker.tsx       # Month/year selector
    ├── account-selector.tsx        # Account selector
    └── category-selector.tsx       # Category selector
```

### 5.3 State Management

```typescript
// stores/
├── auth-store.ts                   # Authentication state
├── dashboard-store.ts              # Dashboard data
├── budget-store.ts                 # Budget data
├── transaction-store.ts            # Transaction data
├── report-store.ts                 # Report data
└── ui-store.ts                     # UI state (modals, toasts)

// hooks/
├── use-auth.ts                     # Authentication hook
├── use-monthly-data.ts             # Fetch monthly data
├── use-transactions.ts             # Transaction CRUD
├── use-budgets.ts                  # Budget CRUD
├── use-reports.ts                  # Report generation
└── use-reminders.ts                # Reminder management
```

---

## 6. Business Logic Calculations

### 6.1 Core Calculations (Replicating Excel Logic)

```typescript
// lib/calculations.ts

// 1. Total Income Calculation
export const calculateTotalIncome = (incomeSources: IncomeSource[]): number => {
  return incomeSources.reduce((sum, source) => sum + source.amount, 0);
};

// 2. Total Savings Calculation
export const calculateTotalSavings = (savings: Saving[]): number => {
  return savings.reduce((sum, saving) => sum + saving.amount, 0);
};

// 3. Total Expenses by Category
export const calculateExpensesByCategory = (
  transactions: Transaction[],
  categoryId: string
): number => {
  return transactions
    .filter(t => t.categoryId === categoryId)
    .reduce((sum, t) => sum + t.amount, 0);
};

// 4. Total Expenses
export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

// 5. Grand Total (Income + Savings)
export const calculateGrandTotal = (
  totalIncome: number,
  totalSavings: number
): number => {
  return totalIncome + totalSavings;
};

// 6. Allocated Money
export const calculateAllocatedMoney = (
  totalIncome: number,
  totalSavings: number,
  totalBudget: number
): number => {
  return (totalIncome - totalSavings) / totalBudget;
};

// 7. Non-Allocated Money
export const calculateNonAllocatedMoney = (
  totalIncome: number,
  totalSavings: number,
  totalExpenses: number
): number => {
  return totalIncome - totalSavings - totalExpenses;
};

// 8. Budget Usage Percentage
export const calculateBudgetUsage = (
  realization: number,
  allocation: number
): number => {
  if (allocation === 0) return 0;
  return realization / allocation;
};

// 9. Needs vs Wants vs Savings Breakdown
export const calculateBreakdown = (
  transactions: Transaction[],
  categories: Category[]
): {
  needs: number;
  wants: number;
  savings: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
} => {
  const total = calculateTotalExpenses(transactions);
  
  const needs = transactions
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.mainCategory === 'Needs';
    })
    .reduce((sum, t) => sum + t.amount, 0);
    
  const wants = transactions
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.mainCategory === 'Wants';
    })
    .reduce((sum, t) => sum + t.amount, 0);
    
  const savings = transactions
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.mainCategory === 'Savings';
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    needs,
    wants,
    savings,
    needsPercentage: total > 0 ? needs / total : 0,
    wantsPercentage: total > 0 ? wants / total : 0,
    savingsPercentage: total > 0 ? savings / total : 0,
  };
};

// 10. Year-over-Year Comparison
export const calculateYearlyComparison = (
  currentYearData: MonthlyData[],
  previousYearData: MonthlyData[]
): {
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
} => {
  const currentIncome = currentYearData.reduce((sum, m) => sum + m.income, 0);
  const previousIncome = previousYearData.reduce((sum, m) => sum + m.income, 0);
  
  const currentExpenses = currentYearData.reduce((sum, m) => sum + m.expenses, 0);
  const previousExpenses = previousYearData.reduce((sum, m) => sum + m.expenses, 0);
  
  const currentSavings = currentYearData.reduce((sum, m) => sum + m.savings, 0);
  const previousSavings = previousYearData.reduce((sum, m) => sum + m.savings, 0);
  
  return {
    incomeChange: previousIncome > 0 
      ? ((currentIncome - previousIncome) / previousIncome) * 100 
      : 0,
    expenseChange: previousExpenses > 0 
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
      : 0,
    savingsChange: previousSavings > 0 
      ? ((currentSavings - previousSavings) / previousSavings) * 100 
      : 0,
  };
};

// 11. Simple Forecast (3-month moving average)
export const calculateForecast = (
  historicalData: MonthlyData[],
  monthsToForecast: number
): ForecastData[] => {
  const last3Months = historicalData.slice(-3);
  const avgIncome = last3Months.reduce((sum, m) => sum + m.income, 0) / 3;
  const avgExpenses = last3Months.reduce((sum, m) => sum + m.expenses, 0) / 3;
  const avgSavings = last3Months.reduce((sum, m) => sum + m.savings, 0) / 3;
  
  const forecast: ForecastData[] = [];
  const lastMonth = historicalData[historicalData.length - 1];
  
  for (let i = 1; i <= monthsToForecast; i++) {
    const nextMonth = lastMonth.month + i;
    const nextYear = lastMonth.year + Math.floor((nextMonth - 1) / 12);
    const adjustedMonth = ((nextMonth - 1) % 12) + 1;
    
    forecast.push({
      month: adjustedMonth,
      year: nextYear,
      predictedIncome: Math.round(avgIncome),
      predictedExpenses: Math.round(avgExpenses),
      predictedSavings: Math.round(avgSavings),
      confidence: 0.7 - (i * 0.1), // Confidence decreases with time
    });
  }
  
  return forecast;
};
```

---

## 7. Database Queries (Supabase)

### 7.1 Key Queries

```typescript
// lib/supabase/queries.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 1. Get Monthly Dashboard Data
export const getMonthlyDashboard = async (
  userId: string,
  month: number,
  year: number
) => {
  // Get income sources
  const { data: incomeSources } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year);

  // Get savings
  const { data: savings } = await supabase
    .from('savings')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year);

  // Get budgets with categories
  const { data: budgets } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (*)
    `)
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year);

  // Get transactions for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);

  return {
    incomeSources,
    savings,
    budgets,
    transactions,
  };
};

// 2. Get Yearly Data
export const getYearlyData = async (userId: string, year: number) => {
  const monthlyData = [];
  
  for (let month = 1; month <= 12; month++) {
    const { data: income } = await supabase
      .from('income_sources')
      .select('amount')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year);
    
    const { data: savings } = await supabase
      .from('savings')
      .select('amount')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year);
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    monthlyData.push({
      month,
      income: income?.reduce((sum, i) => sum + i.amount, 0) || 0,
      savings: savings?.reduce((sum, s) => sum + s.amount, 0) || 0,
      expenses: transactions?.reduce((sum, t) => sum + t.amount, 0) || 0,
    });
  }
  
  return monthlyData;
};

// 3. Get Category Spending
export const getCategorySpending = async (
  userId: string,
  categoryId: string,
  month: number,
  year: number
) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const { data } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .gte('date', startDate)
    .lte('date', endDate);
  
  return data?.reduce((sum, t) => sum + t.amount, 0) || 0;
};

// 4. Get Reminders Due
export const getDueReminders = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .lte('due_date', today)
    .order('due_date', { ascending: true });
  
  return data;
};
```

---

## 8. Cron Jobs & Automation

### 8.1 Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 0 1 * *"
    },
    {
      "path": "/api/cron/reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 8.2 Backup Cron Job

```typescript
// app/api/cron/backup/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get current date for backup filename
    const now = new Date();
    const backupDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Backup all user data
    const tables = [
      'users',
      'income_sources',
      'categories',
      'budgets',
      'transactions',
      'savings',
      'saving_goals',
      'reminders',
    ];

    const backups: Record<string, any> = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      backups[table] = data;
    }

    // Store backup in Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(
        `monthly/${backupDate}.json`,
        JSON.stringify(backups),
        { contentType: 'application/json' }
      );

    if (uploadError) throw uploadError;

    // Clean up old backups (keep last 12 months)
    const { data: oldBackups } = await supabase.storage
      .from('backups')
      .list('monthly');

    if (oldBackups && oldBackups.length > 12) {
      const sortedBackups = oldBackups.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const backupsToDelete = sortedBackups.slice(12);
      for (const backup of backupsToDelete) {
        await supabase.storage
          .from('backups')
          .remove([`monthly/${backup.name}`]);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Backup completed for ${backupDate}` 
    });
  } catch (error) {
    console.error('Backup failed:', error);
    return NextResponse.json(
      { error: 'Backup failed' },
      { status: 500 }
    );
  }
}
```

### 8.3 Daily Reminder Check

```typescript
// app/api/cron/reminders/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const today = new Date().toISOString().split('T')[0];
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    // Get reminders due today or overdue
    const { data: dueReminders } = await supabase
      .from('reminders')
      .select('*, users(email)')
      .eq('is_completed', false)
      .lte('due_date', today);

    // Get upcoming reminders (next 3 days)
    const { data: upcomingReminders } = await supabase
      .from('reminders')
      .select('*, users(email)')
      .eq('is_completed', false)
      .gt('due_date', today)
      .lte('due_date', threeDaysLater.toISOString().split('T')[0]);

    // TODO: Send notifications (email, push)
    // This would integrate with a notification service

    return NextResponse.json({
      success: true,
      dueCount: dueReminders?.length || 0,
      upcomingCount: upcomingReminders?.length || 0,
    });
  } catch (error) {
    console.error('Reminder check failed:', error);
    return NextResponse.json(
      { error: 'Reminder check failed' },
      { status: 500 }
    );
  }
}
```

---

## 9. Excel Import/Export Logic

### 9.1 Excel Import

```typescript
// lib/excel/import.ts

import * as XLSX from 'xlsx';

interface ExcelImportResult {
  incomeSources: Array<{
    name: string;
    amount: number;
    month: number;
    year: number;
  }>;
  savings: Array<{
    name: string;
    accountName: string;
    amount: number;
    month: number;
    year: number;
  }>;
  budgets: Array<{
    category: string;
    accountName: string;
    allocation: number;
    month: number;
    year: number;
  }>;
  transactions: Array<{
    date: Date;
    description: string;
    category: string;
    amount: number;
    accountName: string;
  }>;
}

export const parseExcelFile = (file: File): Promise<ExcelImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const result: ExcelImportResult = {
          incomeSources: [],
          savings: [],
          budgets: [],
          transactions: [],
        };

        // Parse each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Detect sheet type and parse accordingly
          if (sheetName.includes('Budget') || sheetName.includes('Monthly')) {
            parseMonthlyBudgetSheet(jsonData, result);
          } else if (sheetName.includes('Spending') || sheetName.includes('Transaction')) {
            parseTransactionSheet(jsonData, result);
          }
        });

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const parseMonthlyBudgetSheet = (
  data: any[][],
  result: ExcelImportResult
) => {
  // Find year from the sheet
  const yearRow = data.find(row => row[0] === 'Year :');
  const year = yearRow ? parseInt(yearRow[1]) : new Date().getFullYear();

  // Parse income sources
  let inIncomeSection = false;
  let inSavingsSection = false;
  let inBudgetSection = false;

  data.forEach((row, index) => {
    const firstCell = String(row[0] || '').trim();

    // Detect sections
    if (firstCell === 'Income Sources') {
      inIncomeSection = true;
      inSavingsSection = false;
      inBudgetSection = false;
      return;
    }
    if (firstCell === 'Saving List') {
      inIncomeSection = false;
      inSavingsSection = true;
      inBudgetSection = false;
      return;
    }
    if (firstCell === 'Budgeting List') {
      inIncomeSection = false;
      inSavingsSection = false;
      inBudgetSection = true;
      return;
    }

    // Parse income
    if (inIncomeSection && row[1] && !firstCell.includes('Total')) {
      for (let month = 1; month <= 12; month++) {
        const amount = parseFloat(row[3 + month] || 0);
        if (amount > 0) {
          result.incomeSources.push({
            name: row[1],
            amount,
            month,
            year,
          });
        }
      }
    }

    // Parse savings
    if (inSavingsSection && row[1] && !firstCell.includes('Total')) {
      for (let month = 1; month <= 12; month++) {
        const amount = parseFloat(row[3 + month] || 0);
        if (amount > 0) {
          result.savings.push({
            name: row[1],
            accountName: row[2] || 'Default',
            amount,
            month,
            year,
          });
        }
      }
    }

    // Parse budgets
    if (inBudgetSection && row[1] && !firstCell.includes('Total')) {
      for (let month = 1; month <= 12; month++) {
        const allocation = parseFloat(row[3 + month] || 0);
        if (allocation > 0) {
          result.budgets.push({
            category: row[1],
            accountName: row[2] || 'Default',
            allocation,
            month,
            year,
          });
        }
      }
    }
  });
};

const parseTransactionSheet = (
  data: any[][],
  result: ExcelImportResult
) => {
  // Skip header rows
  let startRow = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i][2] === 'Date') {
      startRow = i + 1;
      break;
    }
  }

  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (!row[2]) continue; // Skip empty rows

    const date = XLSX.SSF.parse_date_code(row[2]);
    if (!date) continue;

    result.transactions.push({
      date: new Date(date.y, date.m - 1, date.d),
      description: row[3] || '',
      category: row[4] || 'Lainnya',
      amount: parseFloat(row[5] || 0),
      accountName: row[6] || 'Bank Mandiri',
    });
  }
};
```

### 9.2 Excel Export

```typescript
// lib/excel/export.ts

import * as XLSX from 'xlsx';

interface ExportData {
  year: number;
  month: number;
  incomeSources: any[];
  savings: any[];
  budgets: any[];
  transactions: any[];
}

export const exportToExcel = (data: ExportData): Blob => {
  const workbook = XLSX.utils.book_new();

  // 1. Monthly Budget Sheet
  const budgetSheet = createBudgetSheet(data);
  XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Monthly Budget');

  // 2. Spending Tracker Sheet
  const transactionSheet = createTransactionSheet(data.transactions);
  XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Spending Tracker');

  // 3. Dashboard Sheet
  const dashboardSheet = createDashboardSheet(data);
  XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');

  // Generate blob
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
};

const createBudgetSheet = (data: ExportData) => {
  const rows: any[][] = [];

  // Header
  rows.push(['Year :', data.year, '', '', '', '', '', '', '', '', '', '', '', '', '']);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

  // Month headers
  const monthHeaders = ['', 'Month', 'Account', 'Main Category'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  rows.push([...monthHeaders, ...months]);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

  // Income Sources
  rows.push(['', 'Income Sources', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  data.incomeSources.forEach(source => {
    const row = ['', source.name, '', ''];
    for (let m = 1; m <= 12; m++) {
      row.push(source.month === m ? source.amount : '');
    }
    rows.push(row);
  });
  
  // Total Income
  const totalIncomeRow = ['', 'Total Income', '', ''];
  for (let m = 1; m <= 12; m++) {
    const monthTotal = data.incomeSources
      .filter(s => s.month === m)
      .reduce((sum, s) => sum + s.amount, 0);
    totalIncomeRow.push(monthTotal);
  }
  rows.push(totalIncomeRow);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

  // Savings
  rows.push(['', 'Saving List', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  data.savings.forEach(saving => {
    const row = ['', saving.name, saving.accountName, ''];
    for (let m = 1; m <= 12; m++) {
      row.push(saving.month === m ? saving.amount : '');
    }
    rows.push(row);
  });
  
  // Total Savings
  const totalSavingsRow = ['', 'Total Savings', '', ''];
  for (let m = 1; m <= 12; m++) {
    const monthTotal = data.savings
      .filter(s => s.month === m)
      .reduce((sum, s) => sum + s.amount, 0);
    totalSavingsRow.push(monthTotal);
  }
  rows.push(totalSavingsRow);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

  // Budgets
  rows.push(['', 'Budgeting List', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  data.budgets.forEach(budget => {
    const row = ['', budget.category, budget.accountName, budget.mainCategory];
    for (let m = 1; m <= 12; m++) {
      row.push(budget.month === m ? budget.allocation : '');
    }
    rows.push(row);
  });

  return XLSX.utils.aoa_to_sheet(rows);
};

const createTransactionSheet = (transactions: any[]) => {
  const rows: any[][] = [];

  // Header
  rows.push(['', 'Spending Tracker', '', '', '', '']);
  rows.push(['', '', '', '', '', '']);
  rows.push(['', '✔', 'Date', 'Description', 'Category', 'Total', 'Account']);
  rows.push(['', '', '', '', '', '']);

  // Transactions
  transactions.forEach(t => {
    rows.push([
      '',
      false,
      t.date,
      t.description,
      t.category,
      t.amount,
      t.accountName,
    ]);
  });

  return XLSX.utils.aoa_to_sheet(rows);
};

const createDashboardSheet = (data: ExportData) => {
  const rows: any[][] = [];

  // Calculate totals for the month
  const monthIncome = data.incomeSources
    .filter(s => s.month === data.month)
    .reduce((sum, s) => sum + s.amount, 0);
  
  const monthSavings = data.savings
    .filter(s => s.month === data.month)
    .reduce((sum, s) => sum + s.amount, 0);
  
  const monthExpenses = data.transactions
    .filter(t => new Date(t.date).getMonth() + 1 === data.month)
    .reduce((sum, t) => sum + t.amount, 0);

  // Dashboard header
  rows.push(['', 'Money Management Dashboard', '', '', '', '', '', '', '', '', '', '']);
  rows.push(['', '', '', '', '', '', '', '', 'Year :', data.year, '', '', '']);
  rows.push(['', '', '', '', '', '', '', '', 'Month :', getMonthName(data.month), '', '', '']);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '']);

  // Summary
  rows.push(['', 'Monthly Report', '', '', '', '', '', '', '', '', '', '', '']);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '']);
  rows.push(['', 'Total Income', '', '', '', `${data.month} Savings`, '', '', '', '', `${data.month} Spendings`, '', '']);
  rows.push(['', monthIncome, '', '', '', monthSavings, '', '', '', '', monthExpenses, '', '']);

  return XLSX.utils.aoa_to_sheet(rows);
};

const getMonthName = (month: number): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};
```

---

## 10. UI/UX Design Guidelines

### 10.1 Color Palette

```css
/* Tailwind CSS Configuration */
:root {
  /* Primary Colors */
  --primary-50: #f0fdf4;
  --primary-100: #dcfce7;
  --primary-200: #bbf7d0;
  --primary-300: #86efac;
  --primary-400: #4ade80;
  --primary-500: #22c55e;
  --primary-600: #16a34a;
  --primary-700: #15803d;
  --primary-800: #166534;
  --primary-900: #14532d;

  /* Semantic Colors */
  --income: #22c55e;      /* Green */
  --expense: #ef4444;     /* Red */
  --savings: #3b82f6;     /* Blue */
  --warning: #f59e0b;     /* Amber */
  --info: #6366f1;        /* Indigo */

  /* Category Colors */
  --needs: #3b82f6;       /* Blue */
  --wants: #8b5cf6;       /* Purple */
  --savings-cat: #10b981; /* Emerald */
}
```

### 10.2 Component Specifications

#### Dashboard Summary Cards
```typescript
interface SummaryCardProps {
  title: string;
  amount: number;
  trend?: number; // percentage change
  icon: React.ReactNode;
  color: 'income' | 'expense' | 'savings' | 'neutral';
}

// Usage
<SummaryCard
  title="Total Income"
  amount={6547101}
  trend={9.7}
  icon={<WalletIcon />}
  color="income"
/>
```

#### Budget Progress Bar
```typescript
interface BudgetProgressProps {
  category: string;
  allocated: number;
  spent: number;
  mainCategory: 'Needs' | 'Wants' | 'Savings';
}

// Visual indicators:
// - < 50%: Green
// - 50-80%: Blue
// - 80-100%: Yellow
// - > 100%: Red
```

#### Transaction List Item
```typescript
interface TransactionItemProps {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  account: string;
  onEdit: () => void;
  onDelete: () => void;
}
```

### 10.3 Responsive Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};

// Layout adaptations:
// - Mobile: Single column, bottom navigation
// - Tablet: Two columns, sidebar
// - Desktop: Three columns, fixed sidebar
```

---

## 11. Deployment Strategy

### 11.1 Environment Variables

```bash
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret

# .env.production (Production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
CRON_SECRET=your_production_cron_secret
```

### 11.2 Deployment Steps

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations
npx supabase db push

# 3. Build the application
npm run build

# 4. Deploy to Vercel
vercel --prod
```

### 11.3 Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "CRON_SECRET": "@cron_secret"
  },
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 0 1 * *"
    },
    {
      "path": "/api/cron/reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 12. Testing Strategy

### 12.1 Test Coverage

```
/tests
├── unit/
│   ├── calculations.test.ts        # Business logic tests
│   ├── excel-import.test.ts        # Excel parsing tests
│   └── excel-export.test.ts        # Excel generation tests
├── integration/
│   ├── api/
│   │   ├── transactions.test.ts    # Transaction API tests
│   │   ├── budgets.test.ts         # Budget API tests
│   │   └── reports.test.ts         # Report API tests
│   └── database/
│       └── queries.test.ts         # Database query tests
├── e2e/
│   ├── dashboard.spec.ts           # Dashboard flow tests
│   ├── budget.spec.ts              # Budget setup tests
│   └── transactions.spec.ts        # Transaction flow tests
└── fixtures/
    ├── sample-excel.xlsx           # Test Excel file
    └── mock-data.ts                # Mock data for tests
```

### 12.2 Key Test Cases

```typescript
// tests/unit/calculations.test.ts

describe('Financial Calculations', () => {
  describe('calculateTotalIncome', () => {
    it('should sum all income sources', () => {
      const sources = [
        { amount: 5000000 },
        { amount: 1500000 },
      ];
      expect(calculateTotalIncome(sources)).toBe(6500000);
    });
  });

  describe('calculateBudgetUsage', () => {
    it('should calculate correct percentage', () => {
      expect(calculateBudgetUsage(800000, 1000000)).toBe(0.8);
    });

    it('should return 0 for zero allocation', () => {
      expect(calculateBudgetUsage(100000, 0)).toBe(0);
    });
  });

  describe('calculateNonAllocatedMoney', () => {
    it('should calculate remaining money correctly', () => {
      expect(calculateNonAllocatedMoney(6000000, 500000, 4500000))
        .toBe(1000000);
    });
  });
});
```

---

## 13. Security Considerations

### 13.1 Authentication & Authorization

- **Supabase Auth**: Email/password authentication
- **Row Level Security (RLS)**: All database tables have RLS enabled
- **JWT Tokens**: Short-lived access tokens with refresh mechanism
- **Session Management**: Secure session handling with httpOnly cookies

### 13.2 Data Protection

- **Input Validation**: All user inputs validated on both client and server
- **SQL Injection Prevention**: Using Supabase query builder (parameterized queries)
- **XSS Prevention**: React's built-in escaping + DOMPurify for rich text
- **CSRF Protection**: Built-in Next.js CSRF protection

### 13.3 API Security

```typescript
// Middleware for API route protection
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return res;
}
```

---

## 14. Performance Optimization

### 14.1 Frontend Optimization

- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component with lazy loading
- **Caching**: React Query for server state caching
- **Memoization**: React.memo and useMemo for expensive calculations

### 14.2 Database Optimization

```sql
-- Indexes for common queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_budgets_user_month_year ON budgets(user_id, month, year);
CREATE INDEX idx_income_sources_user_month_year ON income_sources(user_id, month, year);
CREATE INDEX idx_savings_user_month_year ON savings(user_id, month, year);
```

### 14.3 API Optimization

- **Pagination**: All list endpoints support pagination
- **Field Selection**: Select only required fields
- **Batch Operations**: Bulk insert/update where possible
- **Edge Functions**: Use Vercel Edge functions for low-latency operations

---

## 15. Future Enhancements

### 15.1 Potential Features

1. **Multi-Currency Support**: Track expenses in multiple currencies
2. **Recurring Transactions**: Automatic recurring expense/income tracking
3. **Bank Integration**: Connect with bank APIs for auto-import
4. **Receipt OCR**: Scan and extract data from receipt photos
5. **Budget Templates**: Pre-defined budget templates
6. **Shared Budgets**: Share budgets with family members
7. **Investment Tracking**: Track stocks, crypto, and other investments
8. **Debt Management**: Track loans and credit card payments
9. **Tax Reporting**: Generate tax reports
10. **AI Insights**: Smart spending recommendations

### 15.2 Scalability Considerations

- **Database Sharding**: If user base grows significantly
- **Caching Layer**: Redis for frequently accessed data
- **CDN**: Use Vercel Edge Network for static assets
- **Analytics**: Integrate analytics for user behavior tracking

---

## 16. Appendix

### 16.1 Glossary

| Term | Definition |
|------|------------|
| **Budget** | Allocated amount for a specific category |
| **Realization** | Actual spending in a category |
| **Allocated Money** | (Income - Savings) / Total Budget |
| **Non-Allocated Money** | Income - Savings - Total Expenses |
| **Needs** | Essential expenses (Kos, Makanan, etc.) |
| **Wants** | Non-essential expenses (Self-reward, etc.) |
| **Savings** | Money set aside for future |

### 16.2 References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [SheetJS Documentation](https://sheetjs.com)

---

## 17. Project Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1: Setup** | 1 week | Project setup, database schema, authentication |
| **Phase 2: Core Features** | 3 weeks | Budget setup, transaction tracking, dashboard |
| **Phase 3: Reports** | 2 weeks | Monthly reports, yearly comparison, forecasting |
| **Phase 4: Import/Export** | 1 week | Excel import/export functionality |
| **Phase 5: Reminders** | 1 week | Reminder system, cron jobs |
| **Phase 6: Polish** | 1 week | UI/UX improvements, testing, bug fixes |
| **Phase 7: Deployment** | 3 days | Production deployment, monitoring setup |

**Total Estimated Duration: 9-10 weeks**

---

*Document Version: 1.0*
*Last Updated: February 2026*
*Author: System Design Team*
