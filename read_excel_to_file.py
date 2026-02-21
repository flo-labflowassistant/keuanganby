import pandas as pd
file_path = r'c:\Users\admin\Desktop\AI\System Projects\by\reference\Bby 2026.xlsx'
with open(r'c:\Users\admin\Desktop\AI\System Projects\by\excel_summary.txt', 'w', encoding='utf-8') as f:
    try:
        xl = pd.ExcelFile(file_path)
        f.write(f'Sheets: {xl.sheet_names}\n\n')
        for sheet in xl.sheet_names:
            f.write(f'--- Sheet: {sheet} ---\n')
            df = xl.parse(sheet)
            f.write(f'Columns: {list(df.columns)}\n')
            f.write(df.head(20).to_string())
            f.write('\n\n')
    except Exception as e:
        f.write(f"Error: {e}\n")
