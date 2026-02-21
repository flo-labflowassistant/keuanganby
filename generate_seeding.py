import pandas as pd
import uuid
import math
import numpy as np

file_path = r'c:\Users\admin\Desktop\AI\System Projects\by\reference\Bby 2026.xlsx'
out_path = r'c:\Users\admin\Desktop\AI\System Projects\by\database_seed.sql'

def clean_val(v):
    if pd.isna(v):
        return None
    if isinstance(v, (int, float)):
        if math.isnan(v):
            return None
    return v

def clean_str(v):
    res = clean_val(v)
    if res is not None:
        return str(res).strip().replace("'", "''")
    return None

try:
    xl = pd.ExcelFile(file_path)
    df_config = xl.parse('Konfigurasi ⚙')
    df_spending_raw = xl.parse('Spending Tracker')
    
    accounts_set = set()
    for acc in df_config['Daftar Akun'].dropna():
        if str(acc).strip() != 'Nama Akun':
            accounts_set.add(str(acc).strip())
            
    # Add accounts from other sheets just in case
    for idx, row in df_spending_raw.iterrows():
        acc = clean_str(row.iloc[6]) if len(row) > 6 else None
        if acc and idx > 2 and acc != 'Account':
            accounts_set.add(acc)
            
    account_map = {}
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("-- INSERTS FOR ACCOUNTS\n")
        f.write("INSERT INTO accounts (id, name, type, balance) VALUES\n")
        acc_values = []
        for acc in accounts_set:
            acc_id = str(uuid.uuid4())
            account_map[acc] = acc_id
            acc_values.append(f"('{acc_id}', '{clean_str(acc)}', 'Bank', 0)")
        if acc_values:
            f.write(",\n".join(acc_values) + ";\n\n")

        # 2. Categories
        f.write("-- INSERTS FOR CATEGORIES\n")
        f.write("INSERT INTO categories (id, name, main_category) VALUES\n")
        category_map = {}
        cat_values = []
        
        # Parse from config
        if 'Daftar Kategori' in df_config.columns and 'Unnamed: 1' in df_config.columns:
            for idx, row in df_config.iterrows():
                cat_name = clean_str(row.get('Daftar Kategori'))
                main_cat = clean_str(row.get('Unnamed: 1'))
                if cat_name and main_cat and cat_name != 'Kategori Pengeluaran':
                    cat_id = str(uuid.uuid4())
                    category_map[cat_name] = cat_id
                    cat_values.append(f"('{cat_id}', '{cat_name}', '{main_cat}')")
        
        # Add 'Income' categories and 'Savings' if any
        income_sources = ['Monthly Salary', 'Freelance/Business']
        for inc in income_sources:
            cat_id = str(uuid.uuid4())
            category_map[inc] = cat_id
            cat_values.append(f"('{cat_id}', '{inc}', 'Income')")
            
        savings_cats = ['General Savings', 'Emergency']
        for sav in savings_cats:
            cat_id = str(uuid.uuid4())
            category_map[sav] = cat_id
            cat_values.append(f"('{cat_id}', '{sav}', 'Savings')")
            
        if cat_values:
             f.write(",\n".join(cat_values) + ";\n\n")

        # 3. Transactions from Spending Tracker
        f.write("-- INSERTS FOR TRANSACTIONS (Spending Tracker)\n")
        trans_values = []
        
        # Data starts around row index 3
        for idx, row in df_spending_raw.iterrows():
            if idx < 3: # Skip headers
                continue
                
            if len(row) < 7:
                continue
                
            date_val = clean_val(row.iloc[2])
            desc_val = clean_str(row.iloc[3])
            cat_val = clean_str(row.iloc[4])
            amount_val = clean_val(row.iloc[5])
            acc_val = clean_str(row.iloc[6])
            
            if date_val and desc_val and amount_val and acc_val:
                try:
                    date_str = pd.to_datetime(date_val).strftime('%Y-%m-%d')
                except:
                    continue
                    
                cat_id = category_map.get(cat_val, 'NULL')
                cat_id_str = f"'{cat_id}'" if cat_id != 'NULL' else 'NULL'
                
                acc_id = account_map.get(acc_val, 'NULL')
                acc_id_str = f"'{acc_id}'" if acc_id != 'NULL' else 'NULL'
                
                t_type = "expense"
                
                if amount_val > 0: # Ensure positive output since we use expense
                    pass
                
                amount_val = abs(amount_val)
                
                trans_values.append(f"(gen_random_uuid(), '{date_str}', '{desc_val}', {amount_val}, '{t_type}', {cat_id_str}, {acc_id_str})")
        
        if trans_values:
            f.write("INSERT INTO transactions (id, transaction_date, description, amount, type, category_id, account_id) VALUES\n")
            f.write(",\n".join(trans_values) + ";\n\n")

        # 4. Income Transactions from Budgeting Sheet
        f.write("-- INSERTS FOR INCOME TRANSACTIONS\n")
        df_budget = xl.parse('Budgeting')
        inc_trans_values = []
        # Baris 3 dan 4 adalah income
        for month_idx, month_name in enumerate(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'Desember'], start=1):
            if month_name in df_budget.columns:
                for row_idx in [3, 4]:
                    val = clean_val(df_budget.loc[row_idx, month_name])
                    source_name = clean_str(df_budget.iloc[row_idx, 1]) # Column 1 is Income Sources
                    if val and source_name in category_map:
                        date_str = f"2026-{month_idx:02d}-01"
                        cat_id_str = f"'{category_map[source_name]}'"
                        
                        default_acc_id = f"'{list(account_map.values())[0]}'" if account_map else 'NULL'
                        
                        inc_trans_values.append(f"(gen_random_uuid(), '{date_str}', 'Income - {source_name}', {val}, 'income', {cat_id_str}, {default_acc_id})")

        if inc_trans_values:
            f.write("INSERT INTO transactions (id, transaction_date, description, amount, type, category_id, account_id) VALUES\n")
            f.write(",\n".join(inc_trans_values) + ";\n\n")

    print(f"Seed file created at {out_path} with {len(trans_values)} expense trans and {len(inc_trans_values)} income trans")
    
except Exception as e:
    print(f"Error: {e}")
