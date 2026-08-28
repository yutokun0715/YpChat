import {
    auth,
    db,
    signInAnonymously,
    collection,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "./firebase.js";

export async function ensureAnonymousUser() {
    if (auth.currentUser) {
        return auth.currentUser;
    }

    const result = await signInAnonymously(auth);
    return result.user;
}

export async function ensureProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
        return snapshot.data();
    }

    const profile = {
        displayName: `Guest-${user.uid.slice(0, 6)}`,
        font: "system",
        plateColor: "#3b82f6",
        status: "online",
        onlineVisible: true,
        dmPolicy: "friends",
        createdAt: serverTimestamp()
    };

    await setDoc(userRef, profile);

    return profile;
}
