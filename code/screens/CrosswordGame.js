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
  const navigation = useNavigation();

  const user = auth.currentUser;

  const fetchGameState = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setcurrentBonusLevel(userData.currentBonusLevel || 0);
      }
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
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
            </ScrollView>
          </SafeAreaView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default CrosswordGame;

// old code here.
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   Text,
//   Alert,
//   ImageBackground,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableWithoutFeedback,
//   Keyboard,
//   ScrollView,
//   Button,
//   Dimensions,
// } from "react-native";
// import { useContext } from "react";
// import { db } from "../firebase";
// import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
// import { PointsContext } from "../components/PointsContext";
// import { auth } from "../firebase";
// import { BlurView } from "expo-blur";
// import { useNavigation } from "@react-navigation/native";
// import MainMenuScreen from "./MainMenuScreen";
// import LottieView from "lottie-react-native";
// const { height } = Dimensions.get("window");

// // Generate the initial crossword grid
// const generateInitialGrid = (filteredWords, currentBonusLevel) => {
//   const initialGrid = Array(7)
//     .fill(null)
//     .map(() => Array(8).fill("X"));

//   filteredWords[currentBonusLevel].forEach(
//     ({ answer, startx, starty, orientation }) => {
//       let x = startx - 1;
//       let y = starty - 1;

//       for (let i = 0; i < answer.length; i++) {
//         if (orientation === "across" && x - i >= 0) {
//           initialGrid[y][x - i] = "";
//         } else if (orientation === "down" && y + i < initialGrid.length) {
//           initialGrid[y + i][x] = "";
//         }
//       }
//     }
//   );
//   return initialGrid;
// };

// // Generate the answer grid
// const generateAnswerGrid = (filteredWords, currentBonusLevel) => {
//   const answerGrid = Array(7)
//     .fill(null)
//     .map(() => Array(8).fill("X"));

//   filteredWords[currentBonusLevel].forEach(
//     ({ answer, startx, starty, orientation }) => {
//       let x = startx - 1;
//       let y = starty - 1;

//       for (let i = 0; i < answer.length; i++) {
//         if (orientation === "across" && x - i >= 0) {
//           answerGrid[y][x - i] = answer[i];
//         } else if (orientation === "down" && y + i < answerGrid.length) {
//           answerGrid[y + i][x] = answer[i];
//         }
//       }
//     }
//   );
//   return answerGrid;
// };

// const CrosswordGame = ({ route }) => {
//   const crosswordData = route.params;
//   const filteredWords = crosswordData.filteredWords;
//   const {
//     easyPoints,
//     setEasyPoints,
//     mediumPoints,
//     setMediumPoints,
//     hardPoints,
//     setHardPoints,
//   } = useContext(PointsContext);
//   const [grid, setGrid] = useState(generateInitialGrid(filteredWords, 0));
//   const [currentBonusLevel, setcurrentBonusLevel] = useState(0);
//   const [showAnimation, setShowAnimation] = useState(false);
//   const navigation = useNavigation();

//   const user = auth.currentUser;

//   const fetchGameState = async () => {
//     if (user) {
//       const userDocRef = doc(db, "users", user.uid);
//       const userDoc = await getDoc(userDocRef);
//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         setcurrentBonusLevel(userData.currentBonusLevel || 0);
//       }
//     }
//   };

//   const saveGameState = async () => {
//     console.log("Saving currentBonusLevel:", currentBonusLevel);
//     if (user) {
//       try {
//         await updateDoc(doc(db, "users", user.uid), {
//           currentBonusLevel,
//         });
//         console.log("Game State Saved Successfully!");
//       } catch (error) {
//         console.log("Error Saving Game State", error);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchGameState();
//   }, []);

//   useEffect(() => {
//     setGrid(generateInitialGrid(filteredWords, currentBonusLevel));
//   }, [currentBonusLevel]);

//   const handleInputChange = (row, col, text) => {
//     const newGrid = [...grid];
//     newGrid[row][col] = text.toUpperCase();
//     setGrid(newGrid);
//   };

//   // Function to check if the user's input matches the answer grid
//   const checkForCompletion = () => {
//     const answerGrid = generateAnswerGrid(filteredWords, currentBonusLevel);
//     const isCorrect = JSON.stringify(grid) === JSON.stringify(answerGrid);

//     if (isCorrect) {
//       // Instead of showing an alert, play the animation
//       setShowAnimation(true);

//       // Call handleNextLevel after a delay (e.g., after animation duration)
//       setTimeout(() => {
//         handleNextLevel();
//       }, 6000); // Match this timeout duration with your animation duration
//     } else {
//       Alert.alert(
//         "Incorrect",
//         "Some of the words are not filled correctly. Please try again."
//       );
//     }
//   };

//   // Function to move to the next level
//   const handleNextLevel = async () => {
//     await updatePoints();

//     if (currentBonusLevel < filteredWords.length - 1) {
//       const nextLevel = currentBonusLevel + 1;
//       setcurrentBonusLevel(nextLevel);
//       setGrid(generateInitialGrid(filteredWords, nextLevel));
//     } else {
//       // Show completion alert only if all levels are done
//       Alert.alert("Congratulations!", "You've completed all levels.", [
//         {
//           text: "OK",
//           onPress: () => {
//             navigation.navigate("MainMenuScreen");
//           },
//         },
//       ]);
//     }

//     // Save game state when progressing to the next level
//     await saveGameState();
//     setShowAnimation(false);
//   };

//   const updatePoints = async () => {
//     if (user) {
//       const pointsRef = doc(db, "users", user.uid);

//       // Calculate new points based on the current points state
//       const newEasyPoints = easyPoints + 100;
//       const newMediumPoints = mediumPoints + 100;
//       const newHardPoints = hardPoints + 100;

//       try {
//         await updateDoc(
//           pointsRef,
//           {
//             easyPoints: newEasyPoints,
//             mediumPoints: newMediumPoints,
//             hardPoints: newHardPoints,
//           },
//           { merge: true }
//         );

//         // Update the context state as well
//         setEasyPoints(newEasyPoints);
//         setMediumPoints(newMediumPoints);
//         setHardPoints(newHardPoints);

//         console.log("Points Updated Successfully");
//       } catch (error) {
//         console.error("Error updating points: ", error);
//       }
//     }
//   };
//   // Render the crossword grid
//   const renderGrid = () => (
//     <View>
//       {grid.map((row, rowIndex) => (
//         <View key={rowIndex} style={styles.row}>
//           {row.map((cell, colIndex) => (
//             <View key={colIndex} style={styles.cellContainer}>
//               {filteredWords[currentBonusLevel].map((entry) => {
//                 const { startx, starty, position } = entry;
//                 if (rowIndex === starty - 1 && colIndex === startx - 1) {
//                   return (
//                     <Text key={`digit-${position}`} style={styles.smallDigit}>
//                       {position}
//                     </Text>
//                   );
//                 }
//                 return null;
//               })}
//               <TextInput
//                 style={[styles.cell, cell === "X" ? styles.staticCell : null]}
//                 value={cell}
//                 editable={cell !== "X"}
//                 onChangeText={(text) =>
//                   handleInputChange(rowIndex, colIndex, text)
//                 }
//                 maxLength={1}
//               />
//             </View>
//           ))}
//         </View>
//       ))}
//     </View>
//   );

//   // Render the crossword questions
//   const renderQuestions = () => {
//     const questions = { across: [], down: [] };

//     filteredWords[currentBonusLevel].forEach(
//       ({ hint, orientation, position }) => {
//         const questionText = `${position}. ${hint}`;
//         questions[orientation].push(
//           <Text key={`question-${position}`} style={styles.questionText}>
//             {questionText}
//           </Text>
//         );
//       }
//     );

//     return (
//       <View>
//         <Text style={styles.headingText}>Across</Text>
//         <View>{questions.across}</View>
//         <Text style={styles.headingText}>Down</Text>
//         <View>{questions.down}</View>
//       </View>
//     );
//   };

//   // Styles
//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//       padding: 20,
//       marginTop: 2,
//     },
//     row: {
//       flexDirection: "row",
//     },
//     cellContainer: {
//       position: "relative",
//     },
//     cell: {
//       borderWidth: 2,
//       margin: 1,
//       borderColor: "#ffef00",
//       width: 40,
//       height: 40,
//       textAlign: "center",
//       backgroundColor: "transparent",
//       borderRadius: 5,
//     },
//     staticCell: {
//       borderColor: "transparent",
//       color: "transparent",
//       backgroundColor: "transparent",
//     },
//     smallDigit: {
//       position: "absolute",
//       top: 2,
//       left: 2,
//       fontSize: 10,
//       fontWeight: "bold",
//       color: "black",
//     },
//     headingText: {
//       fontSize: 20,
//       fontWeight: "bold",
//       marginTop: 20,
//     },
//     questionText: {
//       fontSize: 16,
//       marginVertical: 4,
//     },
//   });

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={{ flex: 1 }}
//       >
//         <ImageBackground
//           source={require("../assets/images/PlainBackground.svg")}
//           resizeMode="cover"
//           className="flex-1 items-center justify-center"
//         >
//           {showAnimation && (
//             <BlurView
//               style={{
//                 position: "absolute",
//                 flex: 1,
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 zIndex: 1, // Ensure it's layered correctly
//               }}
//               blurType="light" // You can choose 'light', 'dark', or 'extra light'
//               blurAmount={50} // Adjust the blur intensity
//             />
//           )}
//           {showAnimation && (
//             <LottieView
//               source={require("../assets/animations/roundCompleteAnimation.json")} // Replace with your Lottie animation file
//               autoPlay
//               loop={false}
//               style={{
//                 position: "absolute",
//                 flex: 1,
//                 width: 400,
//                 height: 400,
//                 top: height / 4,
//                 zIndex: 2, // Layer the animation above the blur
//               }}
//             />
//           )}
//           <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//             <View style={styles.container}>
//               <Text style={styles.levelText}>
//                 {"Level " + (currentBonusLevel + 1)}
//               </Text>
//               {renderGrid()}
//               {renderQuestions()}
//               <View className=" bg-yellow-600 rounded-lg mt-10 border-2 border-yellow-100 shadow-2xl shadow-yellow-900">
//                 <Button
//                   title="Next Level"
//                   onPress={checkForCompletion} // Call the function to check for correctness
//                 />
//               </View>
//             </View>
//           </ScrollView>
//         </ImageBackground>
//       </KeyboardAvoidingView>
//     </TouchableWithoutFeedback>
//   );
// };

// export default CrosswordGame;
