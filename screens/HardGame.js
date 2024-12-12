import React, { useEffect, useState, useContext } from "react";
import { PointsContext } from "../components/PointsContext";
import { db } from "../firebase";
import { auth } from "../firebase"; // Import Firebase auth for user ID
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import {
  View,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import useStreak from "../components/useStreak";
import { Audio } from "expo-av";
import { Asset } from "expo-asset";
import audioMapping from "../src/audioFiles";
import Icon from "react-native-vector-icons/FontAwesome";
// Function to shuffle an array (Fisher-Yates Shuffle Algorithm)
const { height } = Dimensions.get("window");
const shuffleArray = (array) => {
  let shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const Game = ({ route }) => {
  const { filteredWords } = route.params;
  const [tokenizedWord, setTokenizedWord] = useState([]);
  const { hardPoints, setHardPoints } = useContext(PointsContext);
  const [selectedLetters, setSelectedLetters] = useState([]); // Store selected letters
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [currentHardLevel, setCurrentHardLevel] = useState(1);
  const [currentHardRound, setCurrentHardRound] = useState(1);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [completedWord, setCompletedWord] = useState("");
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streakAnimation, setStreakAnimation] = useState(false);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);
  const [hintDescription, setHintDescription] = useState("");
  const [isFirstHintAvailed, setIsFirstHintAvailed] = useState(false);

  const {
    streak,
    highestStreak,
    incrementStreak,
    resetStreak,
    updateHighestStreakInFirestore,
  } = useStreak();

  const fetchUserProgress = async () => {
    try {
      const user = auth.currentUser; // Get the current logged-in user

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Fetched points: ", userData.hardPoints); // Log the fetched points
          setHardPoints(userData.hardPoints || 0);
          setCurrentHardLevel(userData.currentHardLevel || 1);
          setCurrentHardRound(userData.currentHardRound || 1);

          if (userData.selectedHardWord) {
            const tokenized = userData.selectedHardWord.split(" "); // Tokenize the saved word
            setTokenizedWord(tokenized); // Set the tokenized word
            setShuffledLetters(
              shuffleArray([...new Set(tokenized.join("").split(""))])
            ); // Shuffle unique letters
            console.log(
              "Fetched and displayed the saved word: ",
              userData.selectedHardWord
            );
          } else {
            selectRandomWord(); // Select a new word if no word was saved
          }
        } else {
          console.log("No such document! Creating a new one.");
          await setDoc(userDocRef, {
            hardPoints: 0,
            currentHardLevel: 1,
            currentHardRound: 1,
            highestStreak: 0,
            streak: 0,
          });
          setHardPoints(0); // Initialize points in context
          setCurrentHardLevel(1);
          setCurrentHardRound(1);
        }
      } else {
        console.log("User not authenticated");
      }
    } catch (error) {
      console.log("Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const updateLevelAndRoundInFirestore = async (newLevel, newRound) => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid); // Define userDocRef here
      try {
        await updateDoc(userDocRef, {
          currentHardLevel: newLevel,
          currentHardRound: newRound,
        });
      } catch (error) {
        console.error("Error updating level and round in Firestore: ", error);
      }
    }
  };

  const updatePointsInFirestore = async (newPoints) => {
    const user = auth.currentUser;
    const userDocRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userDocRef, { hardPoints: newPoints });
      console.log("Points updated in Firestore: ", newPoints);
    } catch (error) {
      console.error("Error updating points in Firestore: ", error);
    }
  };

  // Select a random word and tokenize it
  const selectRandomWord = async () => {
    // Reset the first hint flag when a new word is selected
    setIsFirstHintAvailed(false);
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    const selectedHardWord = filteredWords[randomIndex];

    if (selectedHardWord && selectedHardWord["Tokenized Urdu Word"]) {
      const tokenized = selectedHardWord["Tokenized Urdu Word"].split(" ");
      const uniqueLetters = [...new Set(tokenized.join("").split(""))]; // Get unique letters

      console.log("The Selected Word is: ", selectedHardWord);
      setTokenizedWord(tokenized); // Set the original tokenized word
      setShuffledLetters(shuffleArray(uniqueLetters)); // Shuffle only unique letters
      setSelectedLetters([]); // Clear selected letters

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userDocRef, {
            selectedHardWord: selectedHardWord["Tokenized Urdu Word"], // Save the selected word
          });
          console.log(
            "Selected word saved to Firestore: ",
            selectedHardWord["Tokenized Urdu Word"]
          );
        } catch (error) {
          console.error("Error saving selected word to Firestore: ", error);
        }
      }
    }
  };

  const playComponentMountAuido = async () => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(require("../assets/audios/bonus-level.mp3"));
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert(
        "Error",
        "Failed to play audio. Please check the file path and try again."
      );
    }
  };
  const playAudio = async (word) => {
    try {
      const audioAsset = audioMapping[word];
      if (!audioAsset) {
        throw new Error(`Audio file for "${word}" not found`);
      }

      // Ensure the asset is downloaded before playing
      const asset = Asset.fromModule(audioAsset);
      await asset.downloadAsync();

      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(asset); // Load the audio
      await soundObject.playAsync(); // Play the audio

      // Optionally unload the sound after playing
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert(
        "Error",
        "Failed to play audio. Please check the file path and try again."
      );
    }
  };
  const playCoinsAudio = async () => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(require("../assets/audios/coins-effect.mp3"));
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert(
        "Error",
        "Failed to play audio. Please check the file path and try again."
      );
    }
  };

  const playLetterTouchAudio = async () => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(require("../assets/audios/blopAudio.mp3"));
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert(
        "Error",
        "Failed to play audio. Please check the file path and try again."
      );
    }
  };

  const playLevelUpAudio = async () => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(require("../assets/audios/level-up.mp3"));
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert(
        "Error",
        "Failed to play audio. Please check the file path and try again."
      );
    }
  };

  useEffect(() => {
    fetchUserProgress();
    playComponentMountAuido();
  }, [filteredWords]);

  useEffect(() => {
    return () => {
      resetStreak(); // This will now upload the current streak and highest streak
    };
  }, []);
  useEffect(() => {
    if (hardPoints > 0) {
      playCoinsAudio();
    }
  }, [hardPoints]);

  // Function to check if the word is correct
  const checkWord = (newSelectedLetters) => {
    const userWord = newSelectedLetters.join("");
    const originalWord = tokenizedWord.join("");

    if (userWord === originalWord) {
      const completedWordObj = filteredWords.find(
        (wordObj) =>
          wordObj["Tokenized Urdu Word"].replace(/\s/g, "") === userWord
      );
      setCompletedWord(completedWordObj["Urdu Word"]);
      setEnglishTranslation(completedWordObj["English Translation"]);

      setIsModalVisible(true); // Show the modal
      setTimeout(() => {
        setIsModalVisible(false); // Auto-hide after a few seconds
      }, 10000);

      Alert.alert("Correct!", `You formed the correct word: ${originalWord}`, [
        {
          text: "OK",
          onPress: async () => {
            const newPoints = hardPoints + 20;
            setHardPoints(newPoints);
            updatePointsInFirestore(newPoints);

            await incrementStreak();
            setStreakAnimation(true);

            // Set a timeout to stop the streak animation after 4 seconds
            setTimeout(() => {
              setStreakAnimation(false);

              // After the streak animation is complete, handle the level-clear animation
              if (currentHardRound < 5) {
                const newRound = currentHardRound + 1;
                setCurrentHardRound(newRound);
                updateLevelAndRoundInFirestore(currentHardLevel, newRound);
              } else {
                const newLevel = currentHardLevel + 1;

                if (newLevel <= 30) {
                  setCurrentHardLevel(newLevel);
                  setCurrentHardRound(1);
                  updateLevelAndRoundInFirestore(newLevel, 1);

                  // Start the level-clear animation after the streak animation completes
                  setShowAnimation(true);
                  playLevelUpAudio();
                  setTimeout(() => {
                    setShowAnimation(false);
                  }, 4000);
                } else {
                  Alert.alert(
                    "Congratulations, You have Completed All levels."
                  );
                }
              }
              selectRandomWord();
            }, 4000); // Wait for the streak animation to finish before proceeding
          },
        },
      ]);
    } else {
      Alert.alert("Try again", "The word is incorrect.");
      resetStreak();
      setSelectedLetters([]);
    }
  };

  // Handle letter touch
  const handleLetterPress = (letter) => {
    playLetterTouchAudio();
    if (selectedLetters.length < tokenizedWord.join("").length) {
      const newSelectedLetters = [...selectedLetters, letter];
      setSelectedLetters(newSelectedLetters);

      // If all letters are selected, check the word
      if (newSelectedLetters.length === tokenizedWord.join("").length) {
        checkWord(newSelectedLetters); // Check if the word formed is correct
      }
    }
  };
  const handleHint = () => {
    const MAX_HINTS = 5;
    console.log("Total Hints Used: ", hintsUsed);

    const currentWordObj = filteredWords.find(
      (wordObj) => wordObj["Tokenized Urdu Word"] === tokenizedWord.join(" ")
    );
    // First hint is always free - show description
    if (!isFirstHintAvailed) {
      if (currentWordObj && currentWordObj["Description"]) {
        setHintDescription(currentWordObj["Description"]);
        setIsDescriptionModalVisible(true);
        setIsFirstHintAvailed(true); // Mark first hint as used
        return;
      }
    }

    if (hardPoints < 100) {
      Alert.alert(
        "No more hints available!",
        "Please play bonus levels to get more hints."
      );
      return; // Exit the function if points are less than 100
    }

    if (hintsUsed < MAX_HINTS) {
      // Find the next empty space index
      const nextEmptyIndex = selectedLetters.length;

      if (nextEmptyIndex < tokenizedWord.length) {
        const letterToReveal = tokenizedWord[nextEmptyIndex];

        // Update selected letters to include the hint
        const newSelectedLetters = [...selectedLetters, letterToReveal];
        setSelectedLetters(newSelectedLetters);

        // Deduct points for using a hint
        const newPoints = hardPoints - 60;
        setHardPoints(newPoints);
        updatePointsInFirestore(newPoints);

        // Increment hints used
        setHintsUsed(hintsUsed + 1);
        handleLetterPress(letterToReveal);
      }
    } else {
      Alert.alert("No more hints available!");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loadingText}>Loading user progress...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <StatusBar hidden={true} />

      <ImageBackground
        source={require("../assets/images/Board.svg")}
        resizeMode="cover"
        className="flex-1 items-center justify-center"
      >
        {showAnimation && (
          <BlurView
            style={{
              position: "absolute",
              flex: 1,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1, // Ensure it's layered correctly
            }}
            blurType="light" // You can choose 'light', 'dark', or 'extra light'
            blurAmount={50} // Adjust the blur intensity
          />
        )}
        {showAnimation && (
          <LottieView
            source={require("../assets/animations/roundCompleteAnimation.json")} // Replace with your Lottie animation file
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              flex: 1,
              width: 400,
              height: 400,
              top: height / 4,
              zIndex: 2, // Layer the animation above the blur
            }}
          />
        )}
        {streakAnimation && (
          <BlurView
            style={{
              position: "absolute",
              flex: 1,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2, // Ensure it's layered correctly
            }}
            blurType="light" // You can choose 'light', 'dark', or 'extra light'
            blurAmount={50} // Adjust the blur intensity
          />
        )}
        {streakAnimation && (
          <LottieView
            source={require("../assets/animations/badgeAnimation.json")} // Replace with your Lottie animation file
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              flex: 1,
              width: 400,
              height: 400,
              top: height / 4,
              zIndex: 2, // Layer the animation above the blur
            }}
          />
        )}
        {streakAnimation && (
          <View
            style={{
              position: "absolute",
              top: height / 2.5,
              alignSelf: "center",
              zIndex: 3,
            }}
          >
            <Text
              style={{ fontSize: 24, color: "#c124b3", fontWeight: "bold" }}
            >
              Streak: {streak}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={{
            position: "absolute",
            left: 5,
            top: height / 2 - 50,
            zIndex: 1,
          }}
          onPress={handleHint}
        >
          <Icon
            name="lightbulb-o"
            size={70}
            color="yellow"
            style={{
              alignSelf: "center",
            }}
          />
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="fade"
          style={{ zIndex: 2 }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View className="bg-white p-5 w-320 h-320 border-1 rounded-lg w-80 h-60 shadow-lg">
              <Text className="text-xl font-bold mb-3 mt-8 text-center">
                {completedWord}
              </Text>
              <Text className="text-lg text-gray-700 text-center">
                Meaning: {englishTranslation}
              </Text>
              <TouchableOpacity
                onPress={() => playAudio(englishTranslation)}
                className="mt-4 bg-blue-500 rounded-full p-2"
              >
                <Text className="text-white font-bold text-center">
                  Play Audio
                </Text>
              </TouchableOpacity>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                className="mt-4 bg-red-500 rounded-full p-2"
              >
                <Text className="text-white font-bold text-center">Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* For Displaying the Hint of Description. */}
        <Modal
          transparent={true}
          visible={isDescriptionModalVisible}
          animationType="fade"
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View className="bg-white p-5 w-320 h-320 border-1 rounded-lg w-80 h-60 shadow-lg">
              <Text className="text-xl font-bold mb-3 mt-8 text-center">
                Hint Description
              </Text>
              <Text className="text-lg text-gray-700 text-center">
                {hintDescription}
              </Text>
              <Pressable
                onPress={() => setIsDescriptionModalVisible(false)}
                className="mt-4 bg-blue-500 rounded-full p-2"
              >
                <Text className="text-white font-bold text-center">Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <SafeAreaView className="flex-1 justify-between items-end w-full flex-end">
          <View className="absolute top-3 left-7 ml-2">
            <Text className="text-xl text-yellow-500 font-bold">
              Level: {currentHardLevel}
            </Text>
          </View>
          <View
            className={`absolute ${
              Platform.OS === "ios"
                ? "top-2 right-7 mr-2"
                : "top-4 right-8 mr-4"
            }`}
          ></View>
          <Text
            className={`text-xl text-blue-500 font-bold ${
              Platform.OS === "ios"
                ? "mt-1 top-[-10] mr-10"
                : "mt-2 top-0 mr-12"
            }`}
          >
            {hardPoints !== undefined ? hardPoints : 0}
          </Text>
          {/* Empty spaces to display selected letters */}
          <View
            className="w-full justify-center flex-row flex-wrap border-1 p-2 mt-5"
            style={{ height: height * 0.4 }}
          >
            {tokenizedWord.length > 0 && (
              <View
                style={{
                  flexDirection: "row-reverse",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                {tokenizedWord
                  .join("")
                  .split("")
                  .map((_, index) => (
                    <View
                      key={index}
                      className="w-[60px] border-2 rounded-lg items-center justify-center font-bold h-[60px] bg-yellow-600 mr-2 mt-1"
                    >
                      <Text className="text-2xl">
                        {selectedLetters[index] || ""}
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          </View>

          {/* Scrollable area for letters */}
          <ScrollView
            contentContainerStyle={{
              justifyContent: "center",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
            className="w-full border-1 p-2 mt-8"
            style={{ height: height * 0.5 }}
          >
            {shuffledLetters.map((letter, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleLetterPress(letter)}
              >
                <View className="m-2">
                  <View className="w-[60px] h-[60px] justify-center items-center border-1 border-black bg-yellow-300 m-5 rounded-lg shadow-lg shadow-yellow-500">
                    <Text className="text-2xl">{letter}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dac91d",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "smoke-white",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "black",
  },
});

export default Game;
