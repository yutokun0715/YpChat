import {
    db,
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "./firebase.js";

export async function getMember(
    roomId,
    uid
) {
    const snapshot = await getDoc(
        doc(
            db,
            "rooms",
            roomId,
            "members",
            uid
        )
    );

    return snapshot.exists()
        ? snapshot.data()
        : null;
}

export async function becomeAdmin(
    room,
    user,
    password
) {
    if (password !== room.adminPassword) {
        throw new Error(
            "管理者パスワードが違います。"
        );
    }

    const member = await getMember(
        room.id,
        user.uid
    );

    if (!member) {
        throw new Error(
            "先にルームへ参加してください。"
        );
    }

    if (member.role === "owner") {
        return;
    }

    await setDoc(
        doc(
            db,
            "rooms",
            room.id,
            "members",
            user.uid
        ),
        {
            role: "admin",
            uid: user.uid,
            joinedAt:
                member.joinedAt || serverTimestamp()
        },
        {
            merge: true
        }
    );
}

export async function banUser(
    room,
    actorUid,
    targetUid
) {
    if (actorUid === targetUid) {
        throw new Error(
            "自分自身はBANできません。"
        );
    }

    const target = await getMember(
        room.id,
        targetUid
    );

    if (!target) {
        throw new Error(
            "対象ユーザーは参加していません。"
        );
    }

    if (
        target.role === "owner"
        || target.role === "admin"
    ) {
        throw new Error(
            "管理者・オーナーはBANできません。"
        );
    }

    await setDoc(
        doc(
            db,
            "rooms",
            room.id,
            "bans",
            targetUid
        ),
        {
            uid: targetUid,
            bannedBy: actorUid,
            createdAt: serverTimestamp()
        }
    );

    await deleteDoc(
        doc(
            db,
            "rooms",
            room.id,
            "members",
            targetUid
        )
    );
}

export async function unbanUser(
    roomId,
    uid
) {
    await deleteDoc(
        doc(
            db,
            "rooms",
            roomId,
            "bans",
            uid
        )
    );
}

export async function approveJoin(
    roomId,
    uid
) {
    await setDoc(
        doc(
            db,
            "rooms",
            roomId,
            "members",
            uid
        ),
        {
            uid,
            role: "member",
            joinedAt: serverTimestamp()
        }
    );

    await deleteDoc(
        doc(
            db,
            "rooms",
            roomId,
            "joinRequests",
            uid
        )
    );
}

export async function rejectJoin(
    roomId,
    uid
) {
    await deleteDoc(
        doc(
            db,
            "rooms",
            roomId,
            "joinRequests",
            uid
        )
    );
}
