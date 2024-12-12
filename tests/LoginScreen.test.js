import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../screens/LoginScreen"; // Adjust the path if necessary

test("displays an error when login fails", async () => {
  const mockNavigation = { navigate: jest.fn() };
  const { getByPlaceholderText, getByText } = render(
    <LoginScreen navigation={mockNavigation} />
  );

  const emailInput = getByPlaceholderText("Email");
  const passwordInput = getByPlaceholderText("Password");
  const loginButton = getByText("Login");

  fireEvent.changeText(emailInput, "test@example.com");
  fireEvent.changeText(passwordInput, "password123");

  fireEvent.press(loginButton);

  // Wait for navigation to HomeScreen
  await waitFor(() => {
    expect(mockNavigation.navigate).toHaveBeenCalledWith("HomeScreen");
  });
});
