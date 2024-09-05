import pandas as pd
from nltk.tokenize import word_tokenize
import nltk

# Download the punkt tokenizer if you haven't already
nltk.download('punkt')

# Function to tokenize Urdu words
def tokenize_urdu(text):
    return word_tokenize(text)

# Load the CSV file
input_file = r"D:\FAST\FYP\DataSets\Words-list\Updated-words.csv"  # Update with your input file path
df = pd.read_csv(input_file)

# Tokenize the Urdu words and create a new column
df['Tokenized Urdu Word'] = df['Urdu Word'].apply(tokenize_urdu)

# Save the updated DataFrame to a new CSV file
output_file = 'path/to/your/output_file.csv'  # Update with your output file path
df.to_csv(output_file, index=False)

print("Tokenization complete! Check the output file.")
