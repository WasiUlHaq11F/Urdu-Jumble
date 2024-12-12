import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Button,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useContext } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { PointsContext } from "../components/PointsContext";
import { auth } from "../firebase";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { height } = Dimensions.get("window");
import { Audio } from "expo-av";

// Generate the initial crossword grid
const generateInitialGrid = (filteredWords, currentBonusLevel) => {
  const initialGrid = Array(7)
    .fill(null)
    .map(() => Array(8).fill("X"));

  filteredWords[currentBonusLevel].forEach(
    ({ answer, startx, starty, orientation }) => {
      let x = startx - 1;
      let y = starty - 1;

      for (let i = 0; i < answer.length; i++) {
        if (orientation === "across" && x - i >= 0) {
          initialGrid[y][x - i] = "";
        } else if (orientation === "down" && y + i < initialGrid.length) {
          initialGrid[y + i][x] = "";
        }
      }
    }
  );
  return initialGrid;
};

// Generate the answer grid
const generateAnswerGrid = (filteredWords, currentBonusLevel) => {
  const answerGrid = Array(7)
    .fill(null)
    .map(() => Array(8).fill("X"));

  filteredWords[currentBonusLevel].forEach(
    ({ answer, startx, starty, orientation }) => {
      let x = startx - 1;
      let y = starty - 1;

      for (let i = 0; i < answer.length; i++) {
        if (orientation === "across" && x - i >= 0) {
          answerGrid[y][x - i] = answer[i];
        } else if (orientation === "down" && y + i < answerGrid.length) {
          answerGrid[y + i][x] = answer[i];
        }
      }
    }
  );
  return answerGrid;
};

const CrosswordGame = ({ route }) => {
  const crosswordData = route.params;
  const filteredWords = crosswordData.filteredWords;
  const {
    easyPoints,
    setEasyPoints,
    mediumPoints,
    setMediumPoints,
    hardPoints,
    setHardPoints,
  } = useContext(PointsContext);
  const [grid, setGrid] = useState(generateInitialGrid(filteredWords, 0));
  const [currentBonusLevel, setcurrentBonusLevel] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const user = auth.currentUser;

  const fetchGameState = async () => {
    try {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setcurrentBonusLevel(userData.currentBonusLevel || 0);
        }
      }
    } catch (error) {
      console.log("Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const saveGameState = async () => {
    console.log("Saving currentBonusLevel:", currentBonusLevel);
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          currentBonusLevel,
        });
        console.log("Game State Saved Successfully!");
      } catch (error) {
        console.log("Error Saving Game State", error);
      }
    }
  };

  useEffect(() => {
    fetchGameState();
    playComponentMountAuido();
  }, []);

  useEffect(() => {
    setGrid(generateInitialGrid(filteredWords, currentBonusLevel));
  }, [currentBonusLevel]);

  const handleInputChange = (row, col, text) => {
    const newGrid = [...grid];
    newGrid[row][col] = text.toUpperCase();
    setGrid(newGrid);
  };

  const checkForCompletion = () => {
    const answerGrid = generateAnswerGrid(filteredWords, currentBonusLevel);
    const isCorrect = JSON.stringify(grid) === JSON.stringify(answerGrid);

    if (isCorrect) {
      setShowAnimation(true);
      playLevelUpAudio();
      setTimeout(() => {
        handleNextLevel();
      }, 4000);
    } else {
      Alert.alert(
        "Incorrect",
        "Some of the words are not filled correctly. Please try again."
      );
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

  const handleNextLevel = async () => {
    await updatePoints();

    if (currentBonusLevel < filteredWords.length - 1) {
      const nextLevel = currentBonusLevel + 1;
      setcurrentBonusLevel(nextLevel);
      setGrid(generateInitialGrid(filteredWords, nextLevel));
    } else {
      Alert.alert("Congratulations!", "You've completed all levels.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("MainMenuScreen"),
        },
      ]);
    }

    await saveGameState();
    setShowAnimation(false);
  };
  const updatePoints = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, {
        easyPoints: increment(100),
        mediumPoints: increment(100),
        hardPoints: increment(100),
      });
      console.log("Points incremented in Firestore by 100 each.");
    } catch (error) {
      console.error("Error updating points in Firestore:", error);
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

  // const updatePoints = async (
  //   newEasyPoints,
  //   newHardPoints,
  //   newMediumPoints
  // ) => {
  //   const user = auth.currentUser;
  //   const userDocRef = doc(db, "users", user.uid);
  //   try {
  //     await updateDoc(userDocRef, {
  //       easyPoints: newEasyPoints,
  //       hardPoints: newHardPoints,
  //       mediumPoints: newMediumPoints,
  //     });
  //     console.log(
  //       "Points updated in Firestore: Easy Points",
  //       newEasyPoints,
  //       "Hard Poitns, ",
  //       newHardPoints,
  //       "mediumPoints, : ",
  //       newMediumPoints
  //     );
  //   } catch (error) {
  //     console.error("Error updating points in Firestore: ", error);
  //   }
  // };

  const renderGrid = () => (
    <View>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {row.map((cell, colIndex) => (
            <View key={colIndex} className="relative">
              <TextInput
                className={`${
                  cell === "X"
                    ? "border-transparent text-transparent bg-transparent"
                    : "bg-stone-500"
                } w-10 h-10 m-0.5 text-center rounded`}
                value={cell}
                editable={cell !== "X"}
                onChangeText={(text) =>
                  handleInputChange(rowIndex, colIndex, text)
                }
                maxLength={1}
              />
              {filteredWords[currentBonusLevel].map((entry) => {
                const { startx, starty, position } = entry;
                if (rowIndex === starty - 1 && colIndex === startx - 1) {
                  return (
                    <Text
                      key={`digit-${position}`}
                      className="absolute top-1 left-1 text-xs font-bold text-black"
                    >
                      {position}
                    </Text>
                  );
                }
                return null;
              })}
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderQuestions = () => {
    const questions = { across: [], down: [] };

    filteredWords[currentBonusLevel].forEach(
      ({ hint, orientation, position }) => {
        const questionText = `${position}. ${hint}`;
        questions[orientation].push(
          <Text
            key={`question-${position}`}
            className="text-base my-1 text-gray-900"
          >
            {questionText}
          </Text>
        );
      }
    );

    return (
      <View>
        <Text className="text-2xl font-bold mt-4 text-green-700">Across</Text>
        <View>{questions.across}</View>
        <Text className="text-2xl font-bold mt-4 text-green-700">Down</Text>
        <View>{questions.down}</View>
      </View>
    );
  };

  return (
    <ScrollView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ImageBackground
            source={require("../assets/images/PlainBackground.svg")}
            resizeMode="cover"
            className="flex-1 items-center justify-center"
          >
            {showAnimation && (
              <>
                <BlurView
                  className="absolute top-0 left-0 right-0 bottom-0 z-10"
                  intensity={50}
                  tint="light"
                />
                <LottieView
                  source={require("../assets/animations/roundCompleteAnimation.json")}
                  autoPlay
                  loop={false}
                  className="absolute z-20 w-96 h-96 top-20"
                />
              </>
            )}
            <SafeAreaView>
              <View className="flex-1 justify-center items-center p-5 mt-2 ">
                <Text className="text-3xl text-yellow-800 font-bold mt-4 mb-4">
                  Bonus Level {currentBonusLevel + 1}
                </Text>
                {renderGrid()}
                <View className="mt-4 mb-8">{renderQuestions()}</View>
                <TouchableOpacity
                  onPress={checkForCompletion}
                  className="bg-yellow-500 border-2 border-black rounded-lg py-3 px-8 mt-4"
                >
                  <Text className="text-black  text-center font-bold text-lg">
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ScrollView>
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

export default CrosswordGame;
