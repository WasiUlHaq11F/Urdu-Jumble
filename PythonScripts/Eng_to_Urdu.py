import pandas as pd
from googletrans import Translator

# Initialize the translator
translator = Translator()

# Function to translate words to Urdu
def translate_to_urdu(word):
        translation = translator.translate(word, src='en', dest='ur')
        return translation.text

# Step 1: Read the Excel file containing English words
input_file = 'random_words.xlsx'  # Replace with your actual file name
df = pd.read_excel(input_file)

# Ensure the column name matches the column in your Excel file
english_words = df['English Words'].tolist()

# Step 2: Generate Urdu translations for each word
urdu_translations = [translate_to_urdu(word) for word in english_words]

# Step 3: Save the English words and their Urdu translations into a new Excel file
output_df = pd.DataFrame({
    'English Words': english_words,
    'Urdu Translations': urdu_translations
})

output_file = 'english_to_urdu_translations.xlsx'
output_df.to_excel(output_file, index=False)

print(f"Translations saved to {output_file}")
