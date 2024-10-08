import React, { useState } from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import dataset from "../assets/datasets/final_Dataset.json";
import { useNavigation } from "@react-navigation/native";
import CrossWordData from "../assets/datasets/CrossWordData";
import { Audio } from "expo-av";
const MainMenuScreen = () => {
  const [level, SetLevel] = useState("");
  const [filteredWords, SetFilteredWords] = useState("");
  const navigation = useNavigation();

  function handlePress(level) {
    playLetterTouchAudio();
    SetLevel(level);
    console.log(`The User Selected the ${level}`);

    let localFilteredWords = [];

    if (level === "Crossword") {
      localFilteredWords = CrossWordData;
    } else if (level === "Hard") {
      const easyWords = dataset.filter((item) => item.Level === "Easy");
      const mediumWords = dataset.filter((item) => item.Level === "Medium");
      localFilteredWords = [...easyWords, ...mediumWords];
    } else {
      localFilteredWords = dataset.filter((item) => item.Level === level);
    }

    // Use the filtered words for navigation
    SetFilteredWords(localFilteredWords);
    navigation.navigate(level + "Game", { filteredWords: localFilteredWords });
  }

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

  return (
    <ImageBackground
      source={require("../assets/images/background.svg")}
      resizeMode="cover"
      className="flex-1 items-center justify-center" // Wrap all content inside ImageBackground
    >
      <SafeAreaView className="flex-1 items-center justify-end bottom-20 w-full">
        <TouchableOpacity
          onPress={() => handlePress("Easy")}
          className="bg-green-700 border-4 border-black shadow-lg shadow-green-500 rounded-lg mt-5 w-4/5 p-4"
        >
          <Text className="text-center font-bold text-xl text-white uppercase">
            Easy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePress("Medium")}
          className="bg-yellow-400 shadow-lg shadow-yellow-500 border-4 border-black rounded-lg mt-5 w-4/5 p-4"
        >
          <Text className="text-center font-bold text-xl text-black uppercase">
            Medium
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePress("Hard")}
          className="bg-red-700 border-4 shadow-lg shadow-red-500 border-black rounded-lg mt-5 w-4/5 p-4"
        >
          <Text className="text-center font-bold text-xl text-white uppercase">
            Hard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePress("Crossword")}
          className="bg-purple-700 shadow-lg shadow-purple-500 border-4 border-black rounded-lg mt-5 w-4/5 p-4"
        >
          <Text className="text-center font-bold text-xl text-white uppercase">
            Bonus
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default MainMenuScreen;
