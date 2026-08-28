import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup,
  signOut, onAuthStateChanged, linkWithPopup, signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc,
  deleteDoc, getDocs, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
  getDatabase, ref, set, onValue, onDisconnect, serverTimestamp as rtdbServerTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { getMessaging, getToken, onMessage, isSupported } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdoK4J-XePXui0tlEJkhb0iD0bFgQz1Iw",
  authDomain: "ypchat-1d284.firebaseapp.com",
  projectId: "ypchat-1d284",
  storageBucket: "ypchat-1d284.firebasestorage.app",
  messagingSenderId: "797967072543",
  appId: "1:797967072543:web:e70eda3d0c565a96d6042a",
  measurementId: "G-06N9SNE5TB"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export {
  GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  linkWithPopup, signInAnonymously,
  collection, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
  ref, set, onValue, onDisconnect, rtdbServerTimestamp,
  getMessaging, getToken, onMessage, isSupported
};