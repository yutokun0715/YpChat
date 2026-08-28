import {
    db,
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot
} from "./firebase.js";

function randomCode(length = 8) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

export async function createRoom(user) {
    const name = prompt("ルーム名を入力してください。");

    if (!name?.trim()) {
        return null;
    }

    const joinMode = prompt(
        "参加方式を入力してください。\n\n" +
        "public = 公開\n" +
        "free = 自由参加（コードを知っていれば参加）\n" +
        "approval = 承認制\n" +
        "password = アクセスパスワード制"
    ) || "public";

    const allowedModes = [
        "public",
        "free",
        "approval",
        "password"
    ];

    if (!allowedModes.includes(joinMode)) {
        throw new Error("参加方式が正しくありません。");
    }

    let accessPassword = "";

    if (joinMode === "password") {
        accessPassword = prompt(
            "アクセスパスワードを設定してください。"
        ) || "";

        if (!accessPassword) {
            throw new Error(
                "パスワード参加にはアクセスパスワードが必要です。"
            );
        }
    }

    const adminPassword = prompt(
        "管理者パスワードを設定してください。\n" +
        "これは入室用ではなく、管理者になるためのパスワードです。"
    ) || "";

    if (!adminPassword) {
        throw new Error(
            "管理者パスワードを設定してください。"
        );
    }

    const roomCode = randomCode();

    const roomRef = await addDoc(
        collection(db, "rooms"),
        {
            name: name.trim(),
            code: roomCode,
            ownerUid: user.uid,
            joinMode,
            public: joinMode === "public",
            accessPassword,
            adminPassword,
            createdAt: serverTimestamp()
        }
    );

    await setDoc(
        doc(db, "rooms", roomRef.id, "members", user.uid),
        {
            uid: user.uid,
            role: "owner",
            joinedAt: serverTimestamp()
        }
    );

    return {
        id: roomRef.id,
        code: roomCode
    };
}

export async function getRoomByCode(code) {
    const q = query(
        collection(db, "rooms"),
        where("code", "==", code.trim().toUpperCase())
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const item = snapshot.docs[0];

    return {
        id: item.id,
        ...item.data()
    };
}

export async function isMember(roomId, uid) {
    const snapshot = await getDoc(
        doc(db, "rooms", roomId, "members", uid)
    );

    return snapshot.exists();
}

export async function joinRoomByCode(
    user,
    code,
    requestApproval = true
) {
    const room = await getRoomByCode(code);

    if (!room) {
        throw new Error("ルームコードが見つかりません。");
    }

    const member = await isMember(room.id, user.uid);

    if (member) {
        return {
            room,
            joined: true
        };
    }

    if (room.joinMode === "approval" && requestApproval) {
        await setDoc(
            doc(
                db,
                "rooms",
                room.id,
                "joinRequests",
                user.uid
            ),
            {
                uid: user.uid,
                createdAt: serverTimestamp()
            }
        );

        return {
            room,
            joined: false,
            pending: true
        };
    }

    if (room.joinMode === "password") {
        const password = prompt(
            "アクセスパスワードを入力してください。"
        );

        if (password !== room.accessPassword) {
            throw new Error("アクセスパスワードが違います。");
        }
    }

    await setDoc(
        doc(db, "rooms", room.id, "members", user.uid),
        {
            uid: user.uid,
            role: "member",
            joinedAt: serverTimestamp()
        }
    );

    return {
        room,
        joined: true
    };
}

export function watchPublicRooms(callback) {
    const q = query(
        collection(db, "rooms"),
        where("public", "==", true),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        callback(
            snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }))
        );
    });
}

export function watchMemberRooms(uid, callback) {
    const q = query(
        collection(db, "rooms")
    );

    return onSnapshot(q, async (snapshot) => {
        const rooms = [];

        for (const item of snapshot.docs) {
            const memberSnapshot = await getDoc(
                doc(db, "rooms", item.id, "members", uid)
            );

            if (memberSnapshot.exists()) {
                rooms.push({
                    id: item.id,
                    ...item.data(),
                    memberRole: memberSnapshot.data().role
                });
            }
        }

        callback(rooms);
    });
}

export function watchJoinRequests(
    roomId,
    callback
) {
    const q = query(
        collection(
            db,
            "rooms",
            roomId,
            "joinRequests"
        )
    );

    return onSnapshot(q, (snapshot) => {
        callback(
            snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }))
        );
    });
}
