import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3bNsMAalSnda1rbfFRonI56AhjjFD5BI",
  authDomain: "pelaporanbarang.firebaseapp.com",
  projectId: "pelaporanbarang",
  storageBucket: "pelaporanbarang.firebasestorage.app",
  messagingSenderId: "936438758561",
  appId: "1:936438758561:web:20f9f27bedc860497c84e0",
  measurementId: "G-SJELF9KTM6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };