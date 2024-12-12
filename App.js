import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import MainMenuScreen from "./screens/MainMenuScreen";
import EasyGame from "./screens/EasyGame";
import MediumGame from "./screens/MediumGame";
import HardGame from "./screens/HardGame";
import { PointsProvider } from "./components/PointsContext";
import CrosswordGame from "./screens/CrosswordGame";
import UserProgress from "./screens/UserProgress";
export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <PointsProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen
            options={{ headerShown: false }}
            name="LoginScreen"
            component={LoginScreen}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="HomeScreen"
            component={HomeScreen}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="MainMenuScreen"
            component={MainMenuScreen}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="UserProgress"
            component={UserProgress}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="EasyGame"
            component={EasyGame}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="MediumGame"
            component={MediumGame}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="HardGame"
            component={HardGame}
          />

          <Stack.Screen
            options={{ headerShown: false }}
            name="CrosswordGame"
            component={CrosswordGame}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PointsProvider>
  );
}
