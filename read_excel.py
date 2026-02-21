import pandas as pd
file_path = r'c:\Users\admin\Desktop\AI\System Projects\by\reference\Bby 2026.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    print(f'Sheets: {xl.sheet_names}')
    for sheet in xl.sheet_names:
        print(f'\n--- Sheet: {sheet} ---')
        df = xl.parse(sheet)
        print(df.head(10).to_string())
except Exception as e:
    print(f"Error: {e}")
