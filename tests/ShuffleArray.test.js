import { shuffleArray } from "./suffleArray";

describe("shuffleArray", () => {
  // Test case 1: Verify the function returns an array
  test("should return an array", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(Array.isArray(result)).toBe(true);
  });

  // Test case 2: Verify the length of the output array remains the same
  test("should return an array with the same length as input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.length).toBe(input.length);
  });

  // Test case 3: Verify that all original elements are present in the shuffled array
  test("should contain all original elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);

    input.forEach((item) => {
      expect(result).toContain(item);
    });
  });

  // Test case 4: Check that the original array is not modified
  test("should not modify the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const originalCopy = [...input];
    shuffleArray(input);

    expect(input).toEqual(originalCopy);
  });

  // Test case 5: Verify shuffling for an empty array
  test("should handle empty array", () => {
    const input = [];
    const result = shuffleArray(input);

    expect(result).toEqual([]);
  });

  // Test case 6: Verify shuffling for an array with a single element
  test("should handle single element array", () => {
    const input = [42];
    const result = shuffleArray(input);

    expect(result).toEqual([42]);
  });

  // Test case 7: Check randomness (statistical test)
  test("should provide randomness over multiple shuffles", () => {
    const input = [1, 2, 3, 4, 5];
    const shuffleResults = new Set();

    // Perform multiple shuffles and collect unique arrangements
    for (let i = 0; i < 100; i++) {
      shuffleResults.add(JSON.stringify(shuffleArray(input)));
    }

    // Expect more than one unique arrangement
    expect(shuffleResults.size).toBeGreaterThan(1);
  });

  // Test case 8: Verify shuffling with different data types
  test("should shuffle arrays with different data types", () => {
    const input = [1, "two", { three: 3 }, [4], null];
    const result = shuffleArray(input);

    // Check length and presence of original elements
    expect(result.length).toBe(input.length);
    input.forEach((item) => {
      expect(result).toContain(item);
    });
  });
});
