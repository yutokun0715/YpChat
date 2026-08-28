import {
    db,
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp
} from "./firebase.js";

export async function addTextStamp(
    roomId,
    user,
    text
) {
    const value = text.trim();

    if (!value) {
        return;
    }

    await addDoc(
        collection(
            db,
            "rooms",
            roomId,
            "stamps"
        ),
        {
            text: value,
            ownerUid: user.uid,
            createdAt: serverTimestamp()
        }
    );
}

export async function deleteStamp(
    roomId,
    stampId
) {
    await deleteDoc(
        doc(
            db,
            "rooms",
            roomId,
            "stamps",
            stampId
        )
    );
}

export async function getStamps(roomId) {
    const snapshot = await getDocs(
        collection(
            db,
            "rooms",
            roomId,
            "stamps"
        )
    );

    return snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
    }));
}
