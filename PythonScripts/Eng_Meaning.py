import pandas as pd
import nltk
from nltk.corpus import wordnet

# Download required NLTK data
nltk.download('wordnet')

# Define a function to get the meaning of the word
def get_meaning(word):
    try:
        # Ensure the input is a string
        if isinstance(word, str):
            synsets = wordnet.synsets(word)
            if synsets:
                # Return the definition of the first synset
                return synsets[0].definition()
        return ""
    except Exception:
        return ""  # Return an empty string if there's an error

# Load the input Excel file
input_file = 'urdu_to_eng.xlsx'  # Modify if your filename is different
df = pd.read_excel(input_file)

# Specify the English column from which you want to get the meanings
english_column = 'English Translation'

# Apply the get_meaning function to the English column, ignoring errors
df['Description'] = df[english_column].apply(get_meaning)

# Save the updated DataFrame to a new Excel file
output_file = 'urdu_to_eng_with_descriptions.xlsx'
df.to_excel(output_file, index=False)

print("Descriptions added and saved successfully!")
