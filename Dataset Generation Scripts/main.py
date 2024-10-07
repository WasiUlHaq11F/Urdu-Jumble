import pandas as pd

# Load the dataset with appropriate encoding
try:
    df = pd.read_csv("D:/FAST/FYP/urdu jumble/token/tokenized_urdu_data.csv", encoding='utf-8')
except UnicodeDecodeError:
    print("UTF-8 encoding error encountered. Trying with a different encoding.")
    df = pd.read_csv("D:/FAST/FYP/urdu jumble/token/tokenized_urdu_data.csv", encoding='ISO-8859-1')

# Define the function to categorize the levels based on length
def categorize_level(length):
    if 2 <= length <= 4:
        return 'Easy'
    elif 5 <= length <= 8:
        return 'Medium'
    elif 9 <= length <= 15:
        return 'Hard'
    else:
        return 'Bonus'

# Ensure the column name 'Character Length' exists in the DataFrame
if 'Character Length' in df.columns:
    # Apply the function to the 'Character Length' column and create a new column 'Level'
    df['Level'] = df['Character Length'].apply(categorize_level)

    # Save the updated DataFrame to a new CSV file with the new column
    df.to_csv('categorized_words_with_levels.csv', index=False, encoding='utf-8-sig')  # Use 'utf-8-sig' to handle encoding
    print("Words have been categorized and added as a new column in 'categorized_words_with_levels.csv'")
else:
    print("Column 'Character Length' not found in the CSV file.")
