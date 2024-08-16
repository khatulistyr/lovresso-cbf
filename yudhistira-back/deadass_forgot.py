import pandas as pd

# Load the existing data
file_path = './menu_data.xlsx'
new_file_path = './menu_data_with_id.xlsx'

# Read the Excel file
df = pd.read_excel(file_path)

# Add an ID column as string
df.insert(0, 'id', df.index + 1)
df['id'] = df['id'].astype(str)

# Save the updated DataFrame to a new Excel file
df.to_excel(new_file_path, index=False)

print(f'ID column added and saved to {new_file_path}')
