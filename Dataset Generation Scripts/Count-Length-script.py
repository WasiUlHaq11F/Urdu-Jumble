import pandas as pd

# Load the CSV file
input_file =  r"D:\FAST\FYP\DataSets\Words-list\Updated-words.csv"  # Update with your input file path
df = pd.read_csv(input_file)

# Check if the 'Character Length' column already exists; if so, remove it
if 'Character Length' in df.columns:
    df.drop(columns=['Character Length'], inplace=True)

# Count the character length of each Urdu word
df['Character Length'] = df['Urdu Word'].apply(lambda word: len(word))

# Save the updated DataFrame back to the same CSV file
df.to_csv(input_file, index=False)

print("Character length counting complete! The file has been updated.")
