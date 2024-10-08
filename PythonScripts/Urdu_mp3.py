from gtts import gTTS
import pandas as pd
import os
import re
import time

# Function to sanitize filenames
def sanitize_filename(filename):
    return re.sub(r'[<>:"/\\|?*]', '', filename)

# Load your DataFrame
input_file = 'Urdu_Words_With_Length_Updated.xlsx'  # Update with your actual file name
df = pd.read_excel(input_file)

# Create a directory for audio files if it doesn't exist
audio_dir = 'audio_files'
os.makedirs(audio_dir, exist_ok=True)

# Batch settings
batch_size = 2000  # Number of records per batch
batch_pause_time = 1200  # 20 minutes pause time (1200 seconds)

# Function to generate audio files in batches
def process_batch(batch_df, batch_number):
    for index, row in batch_df.iterrows():
        urdu_word = row['Urdu Word']
        english_translation = row['English Translation']

        # Create the audio file name safely
        if isinstance(english_translation, str) and english_translation.strip():
            # Replace spaces with underscores and sanitize the filename
            safe_filename = sanitize_filename(f"{english_translation.strip().replace(' ', '_')}.mp3")
            audio_file_path = os.path.join(audio_dir, safe_filename)
            
            try:
                # Create and save the audio file
                tts = gTTS(text=urdu_word, lang='ur')
                tts.save(audio_file_path)

                # Check if the file exists and is playable
                if os.path.exists(audio_file_path):
                    print(f"Saved audio for '{urdu_word}' as '{safe_filename}'")
                else:
                    print(f"Failed to save audio for '{urdu_word}'")
            except Exception as e:
                print(f"Error saving audio for '{urdu_word}': {e}")

    print(f"Batch {batch_number} processed.")

# Main loop to process the data in batches
total_rows = len(df)
for i in range(0, total_rows, batch_size):
    # Get the current batch
    batch_df = df.iloc[i:i + batch_size]
    batch_number = (i // batch_size) + 1

    # Process the current batch
    process_batch(batch_df, batch_number)

    # Pause for 20 minutes after processing a batch (except after the last batch)
    if i + batch_size < total_rows:
        print(f"Waiting for 20 minutes before processing the next batch...")
        time.sleep(batch_pause_time)  # 20 minutes pause
