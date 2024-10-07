const fs = require("fs");
const path = require("path");

// Adjust the path to your audio files
const audioDirectory = "../my-app/assets/audios"; // Use path.join for better compatibility
const outputDirectory = path.join(__dirname, "src");

// Ensure the output directory exists
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

// Read audio files and generate require statements
const audioFiles = fs
  .readdirSync(audioDirectory)
  .filter((file) => file.endsWith(".mp3")) // Filter for .mp3 files
  .map((file) => {
    const key = file.replace(".mp3", ""); // Remove the .mp3 extension for the key
    // Wrap the key in quotes to handle special characters
    return `  '${key}': require('../assets/audios/${file}'),`;
  });

// Create the final output string
const output = `const audioMapping = {\n${audioFiles.join(
  "\n"
)}\n};\n\nexport default audioMapping;\n`;

// Write the output to audioFiles.js in the src directory
fs.writeFileSync(path.join(outputDirectory, "audioFiles.js"), output);
console.log("Audio files mapping generated successfully!");
