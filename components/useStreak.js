import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, writeBatch } from "firebase/firestore"; // Import Firestore methods
import { auth, db } from "../firebase"; // Import Firebase instance

const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);

  // Function to upload streak data to Firebase
  const uploadStreaksToFirebase = async () => {
    const userId = auth.currentUser?.uid; // Check if user is logged in
    if (!userId) return; // Ensure user is authenticated

    const userDocRef = doc(db, "users", userId);
    const batch = writeBatch(db); // Start a new batch

    try {
      // Check the current highest streak in Firebase
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const firebaseHighestStreak = docSnap.data().highestStreak || 0;

        // Update highest streak in Firestore if needed
        if (highestStreak > firebaseHighestStreak) {
          updateHighestStreakInFirestore(batch, highestStreak);
        }
      }

      // Upload current streak
      batch.set(userDocRef, { Streak: streak }, { merge: true }); // Merge to ensure existing data isn't overwritten
      await batch.commit(); // Commit the batch
    } catch (error) {
      console.error("Error uploading streaks to Firebase:", error);
    }
  };

  // Increment the streak
  const incrementStreak = async () => {
    setStreak((prevStreak) => {
      const newStreak = prevStreak + 1;

      // If the new streak is the highest, update the highest streak
      if (newStreak > highestStreak) {
        setHighestStreak(newStreak);
      }

      // Upload the updated streak to Firebase
      uploadStreaksToFirebase();

      return newStreak;
    });
  };

  // Reset the streak
  const resetStreak = async () => {
    await uploadStreaksToFirebase();
    setStreak(0);
  };

  const updateHighestStreakInFirestore = (batch, newHighestStreak) => {
    const user = auth.currentUser;
    if (!user) return; // Ensure user exists
    const userDocRef = doc(db, "users", user.uid);

    // Use batch to update highest streak
    batch.update(userDocRef, { highestStreak: newHighestStreak });
    console.log("Highest streak queued for update: ", newHighestStreak);
  };

  return {
    streak,
    highestStreak,
    incrementStreak,
    resetStreak,
  };
};

export default useStreak;
