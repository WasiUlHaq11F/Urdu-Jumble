import pandas as pd

# Function to calculate the length of an Urdu word
def get_urdu_word_length(word):
    if isinstance(word, str):
        return len(word)  # Return the length of the string
    return 0  # Return 0 if the word is not a string

# Load the input Excel file containing Urdu words
input_file = 'Urdu_Words_Character_Tokenized_Latest1.xlsx'  # Change this to your actual file path
df = pd.read_excel(input_file)

# Specify the column containing Urdu words
urdu_column = 'Urdu Word'  # Adjust this according to the actual column name in your file

# Apply the length calculation function to each row in the Urdu column
df['Character Length'] = df[urdu_column].apply(get_urdu_word_length)

# Save the result to a new Excel file
output_file = 'Urdu_Words_With_Length_Updated.xlsx'  # Change this name as needed
df.to_excel(output_file, index=False)

print(f"Length calculation complete. Data saved to {output_file}!")
