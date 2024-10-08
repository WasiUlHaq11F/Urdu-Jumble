import random
import nltk
import pandas as pd

# Download the word corpus from nltk (only needed once)
words = nltk.download('words')

# Get the list of English words
word_list = words.words()

# Set the number of words to generate
num_words = 15000

# Randomly select words
random_words = random.sample(word_list, num_words)

# Save the random words to an Excel file
df = pd.DataFrame(random_words, columns=["Random Words"])
df.to_excel('random_words.xlsx', index=False)

print(f"Generated {num_words} random English words and saved to 'random_words.xlsx'.")
