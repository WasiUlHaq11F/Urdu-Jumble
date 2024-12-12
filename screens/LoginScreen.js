import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Text,
  TextInput,
  View,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    playLetterTouchAudio();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("User signed up:", user);
        alert("Sign Up Successfull!");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/email-already-in-use":
            Alert.alert("This email address is already in use.");
            break;
          case "auth/invalid-email":
            Alert.alert("The email address is not valid.");
            break;
          case "auth/operation-not-allowed":
            Alert.alert("Email/password accounts are not enabled.");
            break;
          case "auth/weak-password":
            Alert.alert(
              "The password is too weak. Please use a stronger password."
            );
            break;
          default:
            Alert.alert(error.message);
            break;
        }
      });
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

  const handleLogin = () => {
    playLetterTouchAudio();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("User Logged In as: ", user.email);
        navigation.navigate("HomeScreen");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/invalid-email":
            alert("The email address is not valid.");
            break;
          case "auth/invalid-credential":
            alert("Incorrect Email Or Password.");
            break;
          default:
            alert(error.message);
            break;
        }
      });
  };

  const handleForgotPassword = async () => {
    playLetterTouchAudio();
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset",
        "An email has been sent to reset your password."
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../assets/images/PlainBackground.svg")}
        resizeMode="cover"
        className="flex-1 justify-center items-center"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="justify-center w-full"
        >
          <View>
            <Image
              className="w-[400] h-[300] pb-10"
              source={require("../assets/images/Logo.svg")}
            />
          </View>

          <View className="w-full px-4 pt-10">
            <TextInput
              placeholder="Email"
              textContentType="emailAddress"
              value={email}
              onChangeText={(text) => setEmail(text)}
              className="border-2 shadow-lg bg-yellow-500 shadow-yellow-900 border-yellow-900 rounded-lg px-4 py-3 w-full mb-4"
            />

            <TextInput
              placeholder="Password"
              value={password}
              textContentType="password"
              onChangeText={(text) => setPassword(text)}
              secureTextEntry
              className="border-2 bg-yellow-500 shadow-lg shadow-yellow-900 border-yellow-900 rounded-lg px-4 py-3 w-full mb-4"
            />

            <TouchableOpacity
              onPress={handleLogin}
              style={{ backgroundColor: "#ECE034" }}
              className="border-2 opacity-2 border-black shadow-xl shadow-yellow-300 rounded-lg mt-5 px-4 py-3 w-full"
            >
              <Text className="text-center font-bold text-xl text-yellow-900">
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="pt-10 text-yellow-900 underline text-center font-bold">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSignUp}>
              <Text className="pt-10 text-yellow-900 underline text-center font-bold">
                Don't Have an Account? SignUp
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;
