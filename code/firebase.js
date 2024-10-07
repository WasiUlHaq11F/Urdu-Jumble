import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6EHSevYw0bKoodUTFfZJnyXKKGez6meM",
  authDomain: "urdu-jumble-95230.firebaseapp.com",
  projectId: "urdu-jumble-95230",
  storageBucket: "urdu-jumble-95230.appspot.com",
  messagingSenderId: "634348752477",
  appId: "1:634348752477:web:5b5d05281524b8353ec7b4",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that one
}

// Initialize Firebase Auth

let auth;
if (!getAuth(app)) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  auth = getAuth(app);
}

const db = getFirestore(app);
export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  sendPasswordResetEmail,
};
