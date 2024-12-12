import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MainMenuScreen from "../screens/MainMenuScreen"; // Adjust the path as necessary
import dataset from "../assets/datasets/final_Dataset.json";
import CrossWordData from "../assets/datasets/CrossWordData";

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe("MainMenuScreen", () => {
  let navigate;

  beforeEach(() => {
    navigate = jest.fn();
  });

  test("renders MainMenuScreen with all buttons", () => {
    const { getByText } = render(<MainMenuScreen />);

    // Check if all level buttons are rendered
    expect(getByText("Easy")).toBeTruthy();
    expect(getByText("Medium")).toBeTruthy();
    expect(getByText("Hard")).toBeTruthy();
    expect(getByText("Bonus")).toBeTruthy();
  });
});
