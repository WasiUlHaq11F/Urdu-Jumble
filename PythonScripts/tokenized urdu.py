import pandas as pd

# Function to tokenize Urdu words into individual characters
def tokenize_urdu_characters(text):
    try:
        if isinstance(text, str):
            # Return a string of individual characters joined without any commas or brackets
            return ' '.join(list(text))  # Converts the list of characters to a string with spaces
        return ''
    except Exception as e:
        print(f"Error tokenizing text: {e}")
        return ''

# Load the input Excel file containing Urdu words
input_file = 'urdu_to_eng_with_descriptions.xlsx' # Change this to your actual file path
df = pd.read_excel(input_file)

# Specify the column containing Urdu words
urdu_column = 'Urdu Word'  # Adjust this according to the actual column name in your file

# Apply the character-level tokenization function to each row in the Urdu column
df['Tokenized Urdu Word'] = df[urdu_column].apply(tokenize_urdu_characters)

# Save the result to a new Excel file
output_file = 'Urdu_Words_With_Length_Updated.xlsx'  # Change this name as needed
df.to_excel(output_file, index=False)

print(f"Character-level tokenization complete. Data saved to {output_file}!")
