import pandas as pd
import json

file_path = r'c:\Users\admin\Desktop\AI\System Projects\by\reference\Bby 2026.xlsx'
df = pd.ExcelFile(file_path).parse('Budgeting')
with open('budget_head.json', 'w', encoding='utf-8') as f:
    json.dump(df.head(10).fillna('').to_dict('records'), f, indent=2)
