import {
    db,
    doc,
    getDoc,
    setDoc
} from "./firebase.js";

export async function loadProfile(uid) {
    const snapshot = await getDoc(
        doc(db, "users", uid)
    );

    return snapshot.exists()
        ? snapshot.data()
        : null;
}

export function fillProfileForm(profile) {
    document.getElementById("displayNameInput").value =
        profile.displayName || "";

    document.getElementById("plateColorInput").value =
        profile.plateColor || "#3b82f6";

    document.getElementById("fontInput").value =
        profile.font || "system";

    document.getElementById("statusInput").value =
        profile.status || "online";

    document.getElementById("dmPolicyInput").value =
        profile.dmPolicy || "friends";
}

export async function saveProfile(uid) {
    const displayName = document
        .getElementById("displayNameInput")
        .value
        .trim();

    if (!displayName) {
        throw new Error("名前を入力してください。");
    }

    await setDoc(
        doc(db, "users", uid),
        {
            displayName,
            plateColor: document.getElementById("plateColorInput").value,
            font: document.getElementById("fontInput").value,
            status: document.getElementById("statusInput").value,
            dmPolicy: document.getElementById("dmPolicyInput").value
        },
        {
            merge: true
        }
    );
}
