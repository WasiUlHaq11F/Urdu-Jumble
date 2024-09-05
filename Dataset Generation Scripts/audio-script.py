from gtts import gTTS
import os


def generate_urdu_voice(word, output_path):
    # Generate the Urdu text-to-speech audio
    tts = gTTS(text=word, lang='ur')

    # Define the output audio file path using the word itself
    audio_file = os.path.join(output_path, f'{word}.mp3')

    # Save the generated audio to the specified file path
    tts.save(audio_file)


if __name__ == '__main__':
    # Path to the input file containing Urdu words
    input_file_path = r'D:\FAST\FYP\DataSets\Words-list\words.txt'

    # Output directory path where the audio files will be saved
    output_directory = r"D:\FAST\FYP\DataSets\audio-files"

    # Create the output directory if it does not exist
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    # Open the input file for reading
    with open(input_file_path, 'r', encoding='utf-8') as file:
        # Read all lines from the file
        lines = file.readlines()

        # Set a flag to indicate whether to start generating audio
        start_generating = False

        # Iterate over each line in the file
        for idx, line in enumerate(lines):
            # If we haven't reached the starting index yet, continue to the next iteration
            if not start_generating:
                if idx == 3637:
                    start_generating = True
                continue

            # Strip any leading/trailing whitespace
            urdu_word = line.strip()

            # Skip empty lines (if any)
            if urdu_word:
                # Call the function to generate and save the Urdu voice
                generate_urdu_voice(urdu_word, output_directory)
                print(f"Audio generated for: {urdu_word}")
