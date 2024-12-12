import React from "react";
import {
  render,
  waitFor,
  screen,
  fireEvent,
} from "@testing-library/react-native";
import UserProgressPage from "../screens/UserProgress";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Audio } from "expo-av";
import * as Share from "react-native";

jest.mock("../firebase", () => ({
  auth: { currentUser: { uid: "testUser" } },
  db: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("expo-av", () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn(),
      playAsync: jest.fn(),
      unloadAsync: jest.fn(),
    })),
  },
}));

// jest.mock("react-native", () => ({
//   ...jest.requireActual("react-native"),
//   Share: { share: jest.fn() },
// }));

describe("UserProgressPage", () => {
  it("renders loading state initially", () => {
    render(<UserProgressPage />);
    expect(screen.getByText("Loading user progress...")).toBeTruthy();
  });

  it("displays no user data message if user data is null", async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });
    render(<UserProgressPage />);
    await waitFor(() =>
      expect(screen.getByText("No user data available.")).toBeTruthy()
    );
  });
});
