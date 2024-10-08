import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import { styled } from "nativewind";
import { Audio } from "expo-av";

const HomeScreen = ({ navigation }) => {
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

  function handlePress(option) {
    playLetterTouchAudio();
    navigation.navigate(option);
  }

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../assets/images/background.svg")}
        resizeMode="cover"
        className="flex-1 justify-center items-center w-full h-full"
      ></ImageBackground>
      <View className="absolute bottom-16 w-full px-4">
        <TouchableOpacity onPress={() => handlePress("MainMenuScreen")}>
          <View
            style={{ backgroundColor: "#ECE034" }}
            className="border-4 shadow-lg shadow-yellow-500 border-black rounded-lg mt-5 w-full h-[80] p-4"
          >
            <Text className="text-center font-bold text-xl text-yellow-900">
              Play
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress("UserProgress")}>
          <View className="border-4 shadow-lg bg-purple-500 shadow-yellow-500 border-black rounded-lg mt-5 w-full h-[80] p-4">
            <Text className="text-center font-bold text-xl text-black">
              User Progress
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
