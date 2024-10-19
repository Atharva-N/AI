// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

const firebaseConfig = {
    apiKey: "AIzaSyClqor3PCbv4Mq3YsY2EEErQnek-XVR3VQ",
    authDomain: "travel-chatbot-434c5.firebaseapp.com",
    projectId: "travel-chatbot-434c5",
    storageBucket: "travel-chatbot-434c5.appspot.com",
    messagingSenderId: "500361852226",
    appId: "1:500361852226:web:3236cdfe662b193de444db",
    measurementId: "G-TM9EVSQ0WK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Export auth, db, and storage as named exports
export { auth, db, storage };
