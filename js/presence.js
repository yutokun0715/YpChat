import {
    realtimeDB,
    ref,
    set,
    onValue,
    onDisconnect,
    rtdbTimestamp
} from "./firebase.js";

export function startPresence(uid) {
    const statusRef = ref(
        realtimeDB,
        `presence/${uid}`
    );

    const connectedRef = ref(
        realtimeDB,
        ".info/connected"
    );

    onValue(connectedRef, (snapshot) => {
        if (snapshot.val() !== true) {
            return;
        }

        onDisconnect(statusRef).set({
            state: "offline",
            lastChanged: rtdbTimestamp()
        });

        set(statusRef, {
            state: "online",
            lastChanged: rtdbTimestamp()
        });
    });
}

export function watchPresence(uid, callback) {
    const statusRef = ref(
        realtimeDB,
        `presence/${uid}`
    );

    return onValue(statusRef, (snapshot) => {
        callback(snapshot.val());
    });
}
