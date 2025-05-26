// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXeUHF19lt1yiVnXmIuZpuJ27Mu9M6XkQ",
  authDomain: "daily-task-manager-4f4bb.firebaseapp.com",
  projectId: "daily-task-manager-4f4bb",
  storageBucket: "daily-task-manager-4f4bb.firebasestorage.app",
  messagingSenderId: "168738269874",
  appId: "1:168738269874:web:e9380be35215a8993e77ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }; 