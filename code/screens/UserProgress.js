import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Share,
  Button,
} from "react-native";
import { auth, db } from "../firebase"; // Firebase config
import { doc, getDoc } from "firebase/firestore";
import * as Progress from "react-native-progress";
import Icon from "react-native-vector-icons/Ionicons";
import Lottie from "lottie-react-native";
import ViewShot from "react-native-view-shot"; // Import ViewShot
import { Audio } from "expo-av";
const { width } = Dimensions.get("window");

const UserProgressPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const viewShotRef = useRef(); // Reference for ViewShotbk]ut

  // Fetch user data from Firestore
  const fetchUserData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
      playLetterTouchAudio();
    }
  };

  const playLetterTouchAudio = async () => {
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

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleShare = async () => {
    // Capture screenshot
    if (viewShotRef.current) {
      try {
        const uri = await viewShotRef.current.capture({
          format: "png", // PNG format for better quality
          quality: 1.0, // Maximum quality
        });
        await Share.share({
          url: uri, // Share the screenshot URI
          title: "My Game Progress",
          message: "Check out my progress in the game!",
        });
      } catch (error) {
        console.error("Error capturing screenshot:", error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading user progress...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No user data available.</Text>
      </View>
    );
  }

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: "png", quality: 1.0 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="person-circle" size={80} color="#fff" />
          <Text style={styles.headerText}>Your Progress</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="flame" size={30} color="#FF5722" />
            <Text style={styles.cardTitle}>Streak Progress</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.statText}>
              Current Streak:{" "}
              <Text style={styles.statValue}>{userData.Streak}</Text>
            </Text>
            <Text style={styles.statText}>
              Highest Streak:{" "}
              <Text style={styles.statValue}>{userData.highestStreak}</Text>
            </Text>
          </View>
          <Lottie
            source={require("../assets/animations/hurray.json")}
            autoPlay
            loop={true}
            style={styles.animation}
          />
        </View>

        {/* Easy Level Progress military_tech*/}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="star-outline" size={30} color="#008000" />
            <Text style={styles.cardTitle}>Easy Level Progress</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.statText}>
              Current Level:{" "}
              <Text style={styles.statValue}>{userData.currentEasyLevel}</Text>
            </Text>
            <Text style={styles.statText}>
              Current Round:{" "}
              <Text style={styles.statValue}>{userData.currentEasyRound}</Text>
            </Text>
            <Text style={styles.statText}>
              Points:{" "}
              <Text style={styles.statValue}>{userData.easyPoints}</Text>
            </Text>
            {userData && userData.currentEasyRound && (
              <Progress.Bar
                progress={userData.currentEasyRound / 5}
                width={width * 0.8}
                color="#4CAF50"
                height={10}
                borderRadius={5}
                style={styles.progressBar}
              />
            )}
            <Text style={styles.progressText}>
              Round {userData.currentEasyRound} of 5
            </Text>
          </View>
          <Lottie
            source={require("../assets/animations/hurray.json")}
            autoPlay
            loop={true}
            style={styles.animation}
          />
        </View>
        {/* Medium Level Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="star-outline" size={30} color="#0000FF" />
            <Text style={styles.cardTitle}>Medium Level Progress</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.statText}>
              Current Level:{" "}
              <Text style={styles.statValue}>
                {userData.currentMediumLevel}
              </Text>
            </Text>
            <Text style={styles.statText}>
              Current Round:{" "}
              <Text style={styles.statValue}>
                {userData.currentMediumRound}
              </Text>
            </Text>
            <Text style={styles.statText}>
              Points:{" "}
              <Text style={styles.statValue}>{userData.mediumPoints}</Text>
            </Text>
            {userData && userData.currentMediumRound && (
              <Progress.Bar
                progress={userData.currentMediumRound / 5}
                width={width * 0.8}
                color="#2196F3"
                height={10}
                borderRadius={5}
                style={styles.progressBar}
              />
            )}
            <Text style={styles.progressText}>
              Round {userData.currentMediumRound} of 5
            </Text>
          </View>
          <Lottie
            source={require("../assets/animations/hurray.json")}
            autoPlay
            loop={true}
            style={styles.animation}
          />
        </View>
        {/* Hard Level Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="star-outline" size={30} color="#BF40BF" />
            <Text style={styles.cardTitle}>Hard Level Progress</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.statText}>
              Points:{" "}
              <Text style={styles.statValue}>{userData.hardPoints}</Text>
            </Text>
            {userData && userData.hardPoints && (
              <Progress.Bar
                progress={userData.hardPoints / 1000}
                width={width * 0.8}
                color="#9C27B0"
                height={10}
                borderRadius={5}
                style={styles.progressBar}
              />
            )}
            <Text style={styles.progressText}>
              Progress towards 1000 points
            </Text>
          </View>
          <Lottie
            source={require("../assets/animations/hurray.json")}
            autoPlay
            loop={true}
            style={styles.animation}
          />
        </View>
        {/* Bonus Level Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="star-outline" size={30} color="#FFC107" />
            <Text style={styles.cardTitle}>Bonus Level Progress</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.statText}>
              Current Bonus Level:{" "}
              <Text style={styles.statValue}>{userData.currentBonusLevel}</Text>
            </Text>
            {userData && userData.currentBonusLevel && (
              <Progress.Bar
                progress={userData.currentBonusLevel / 10}
                width={width * 0.8}
                color="#FFC107"
                height={10}
                borderRadius={5}
                style={styles.progressBar}
              />
            )}
            <Text style={styles.progressText}>
              Bonus Level {userData.currentBonusLevel} of 10
            </Text>
          </View>
          <Lottie
            source={require("../assets/animations/hurray.json")}
            autoPlay
            loop={true}
            style={styles.animation}
          />
        </View>
        {/* Share Button */}
        <View style={styles.shareButtonContainer}>
          <Button title="Share Progress" onPress={handleShare} />
        </View>
      </ScrollView>
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a855f7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  header: {
    backgroundColor: "#b491c8",
    paddingVertical: 30,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  cardContent: {
    marginTop: 10,
  },
  statText: {
    fontSize: 16,
    marginBottom: 5,
  },
  statValue: {
    fontWeight: "bold",
  },
  progressBar: {
    marginVertical: 10,
  },
  progressText: {
    fontSize: 14,
    color: "#555",
  },
  shareButtonContainer: {
    marginTop: 20,
    alignItems: "center",
    border: 2,
    backgroundColor: "yellow",
    borderRadius: 19,
    margin: 50,
  },
  animation: {
    position: "absolute", // Make the animation absolute
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});

export default UserProgressPage;
