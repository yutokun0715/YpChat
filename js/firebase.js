import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getDatabase,
    ref,
    set,
    onValue,
    onDisconnect,
    serverTimestamp as rtdbTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdoK4J-XePXui0tlEJkhb0iD0bFgQz1Iw",
  authDomain: "ypchat-1d284.firebaseapp.com",
  projectId: "ypchat-1d284",
  storageBucket: "ypchat-1d284.firebasestorage.app",
  messagingSenderId: "797967072543",
  appId: "1:797967072543:web:e70eda3d0c565a96d6042a",
  measurementId: "G-06N9SNE5TB"
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const realtimeDB = getDatabase(firebaseApp);

export {
    signInAnonymously,
    onAuthStateChanged,

    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,

    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,

    ref,
    set,
    onValue,
    onDisconnect,
    rtdbTimestamp
};
