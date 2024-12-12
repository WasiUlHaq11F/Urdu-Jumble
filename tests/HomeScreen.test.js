import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomeScreen from "../screens/HomeScreen"; // Adjust the import path accordingly

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe("HomeScreen", () => {
  let navigate;

  beforeEach(() => {
    navigate = jest.fn();
  });

  test("renders HomeScreen with buttons", () => {
    const { getByText } = render(<HomeScreen navigation={{ navigate }} />);

    // Check if the buttons are rendered
    expect(getByText("Play")).toBeTruthy();
    expect(getByText("User Progress")).toBeTruthy();
  });

  test("navigates to MainMenuScreen when Play button is pressed", async () => {
    const { getByText } = render(<HomeScreen navigation={{ navigate }} />);

    // Simulate button press
    fireEvent.press(getByText("Play"));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("MainMenuScreen");
    });
  });

  test("navigates to UserProgress when User Progress button is pressed", async () => {
    const { getByText } = render(<HomeScreen navigation={{ navigate }} />);

    // Simulate button press
    fireEvent.press(getByText("User Progress"));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("UserProgress");
    });
  });
});
