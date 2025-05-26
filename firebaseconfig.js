// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXeUHF19lt1yiVnXmIuZpuJ27Mu9M6XkQ",
  authDomain: "daily-task-manager-4f4bb.firebaseapp.com",
  projectId: "daily-task-manager-4f4bb",
  storageBucket: "daily-task-manager-4f4bb.firebasestorage.app",
  messagingSenderId: "168738269874",
  appId: "1:168738269874:web:e9380be35215a8993e77ab",
  measurementId: "G-YL94ZXM1LL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);