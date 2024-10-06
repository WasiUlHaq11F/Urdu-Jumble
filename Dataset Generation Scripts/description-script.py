import pandas as pd
import requests

def get_urdu_description(urdu_word, api_key):
    url = f"https://translation.googleapis.com/language/translate/v2"
    params = {
        'q': urdu_word,
        'source': 'ur',
        'target': 'en',
        'format': 'text',
        'key': api_key
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        result = response.json()
        if 'data' in result and 'translations' in result['data']:
            return result['data']['translations'][0]['translatedText']
    return 'Description not found'


# Load the CSV file
input_file = r"D:\FAST\FYP\DataSets\Words-list\Updated-words.csv"
api_key = ''

df = pd.read_csv(input_file)

# Check if the 'English Description' column already exists; if so, remove it
if 'English Description' in df.columns:
    df.drop(columns=['English Description'], inplace=True)

# Find the English description for each Urdu word
df['English Description'] = df['Urdu Word'].apply(lambda word: get_urdu_description(word, api_key))

# Save the updated DataFrame back to the same CSV file
df.to_csv(input_file, index=False)

print("Description fetching complete! The file has been updated.")
