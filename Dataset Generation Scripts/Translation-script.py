import csv
from googletrans import Translator

def translate_urdu_to_english(urdu_word):
    try:
        translator = Translator()
        translation = translator.translate(urdu_word, src='ur', dest='en')
        return translation.text
    except Exception as e:
        print(f"Translation error for '{urdu_word}': {e}")
        return ""

def translate_urdu_csv(input_csv_file, output_csv_file):
    with open(input_csv_file, 'r', encoding='utf-8') as csv_file:
        reader = csv.reader(csv_file)
        rows = list(reader)

    translated_rows = []
    for row in rows:
        urdu_word = row[0]
        english_translation = trans
        translated_row = [urdu_word, english_translation]
        translated_rows.append(translated_row)

    with open(output_csv_file, 'w', encoding='utf-8', newline='') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerows(translated_rows)

if __name__ == "__main__":
    input_csv_file = r"D:\FAST\FYP\DataSets\Words-list\Updated-words.csv"
    output_csv_file = "output_translations.csv"

    translate_urdu_csv(input_csv_file, output_csv_file)
