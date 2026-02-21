import pandas as pd
import json

file_path = r'c:\Users\admin\Desktop\AI\System Projects\by\reference\Bby 2026.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    df_budget = xl.parse('Budgeting')
    allocations = {}
    
    # We dump raw rows to see directly
    for i in range(2, 28):
        try:
            cat = df_budget.loc[i, 'Unnamed: 1']
            amt = df_budget.loc[i, 'Unnamed: 4']
            if pd.notna(cat) and pd.notna(amt) and cat != 'Category Name' and cat != 'Income Sources' and cat != 'Saving List':
                cat_str = str(cat).strip()
                amt_int = int(amt) if str(amt).replace('.','',1).isdigit() else 0
                if amt_int > 0:
                   allocations[cat_str] = amt_int
        except Exception as inner_e:
            pass

    # Generate SQL
    sql_updates = []
    sql_updates.append("-- UPDATE BUDGET ALLOCATIONS")
    for cat_name, amt in allocations.items():
        sql_updates.append(f"UPDATE categories SET budget_allocation = {amt} WHERE name = '{cat_name}';")

    with open('update_budgets.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_updates))
    
    print("Generated update_budgets.sql")
    print(json.dumps(allocations, indent=2))
except Exception as e:
    print('Fatal Error:', e)
