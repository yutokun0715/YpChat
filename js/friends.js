import {
    db,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "./firebase.js";

export async function searchUsersByName(name) {
    const q = query(
        collection(db, "users"),
        where("displayName", "==", name.trim())
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((item) => ({
        uid: item.id,
        ...item.data()
    }));
}

export async function sendFriendRequest(
    fromUid,
    toUid
) {
    if (fromUid === toUid) {
        throw new Error("自分には申請できません。");
    }

    const requestId =
        `${fromUid}_${toUid}`;

    await setDoc(
        doc(
            db,
            "friendRequests",
            requestId
        ),
        {
            fromUid,
            toUid,
            status: "pending",
            createdAt: serverTimestamp()
        }
    );
}

export async function getFriendRequests(uid) {
    const q = query(
        collection(db, "friendRequests"),
        where("toUid", "==", uid),
        where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
    }));
}

export async function acceptFriendRequest(
    request
) {
    await setDoc(
        doc(
            db,
            "users",
            request.fromUid,
            "friends",
            request.toUid
        ),
        {
            uid: request.toUid,
            createdAt: serverTimestamp()
        }
    );

    await setDoc(
        doc(
            db,
            "users",
            request.toUid,
            "friends",
            request.fromUid
        ),
        {
            uid: request.fromUid,
            createdAt: serverTimestamp()
        }
    );

    await setDoc(
        doc(
            db,
            "friendRequests",
            request.id
        ),
        {
            status: "accepted"
        },
        {
            merge: true
        }
    );
}

export async function getFriends(uid) {
    const snapshot = await getDocs(
        collection(
            db,
            "users",
            uid,
            "friends"
        )
    );

    return snapshot.docs.map((item) => ({
        uid: item.id,
        ...item.data()
    }));
}
