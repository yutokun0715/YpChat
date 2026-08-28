import {
    auth,
    db,
    onAuthStateChanged,
    collection,
    doc,
    getDoc
} from "./firebase.js";

import {
    ensureAnonymousUser,
    ensureProfile
} from "./auth.js";

import {
    startPresence
} from "./presence.js";

import {
    createRoom,
    getRoomByCode,
    joinRoomByCode,
    watchPublicRooms,
    watchMemberRooms,
    watchJoinRequests
} from "./rooms.js";

import {
    watchMessages,
    renderMessages,
    sendRoomMessage
} from "./chat.js";

import {
    loadProfile,
    fillProfileForm,
    saveProfile
} from "./profile.js";

import {
    searchUsersByName,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    getFriends
} from "./friends.js";

import {
    ensureDMThread,
    sendDM,
    watchDM,
    renderDMMessages
} from "./dm.js";

import {
    becomeAdmin,
    banUser,
    unbanUser,
    approveJoin,
    rejectJoin,
    getMember
} from "./admin.js";

import {
    addTextStamp,
    getStamps,
    deleteStamp
} from "./stamps.js";

import {
    enableNotifications
} from "./notifications.js";

import {
    startCamera,
    stopCamera
} from "./stream.js";

let currentUser = null;
let currentProfile = null;
let currentRoom = null;
let currentRoomRole = null;
let unsubscribeMessages = null;
let unsubscribeRooms = null;
let unsubscribePublicRooms = null;
let currentDMThread = null;

const profilesCache = new Map();

window.YpChat = {
    get user() {
        return currentUser;
    },

    get room() {
        return currentRoom;
    }
};

function $(id) {
    return document.getElementById(id);
}

function showPage(name) {
    document
        .querySelectorAll(".page")
        .forEach((page) => {
            page.classList.add("hidden");
        });

    const page = $(`${name}Page`);

    if (page) {
        page.classList.remove("hidden");
    }

    document
        .querySelectorAll(".nav-button")
        .forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.page === name
            );
        });
}

function openModal(html) {
    $("modalContent").innerHTML = html;
    $("modal").classList.remove("hidden");
}

function closeModal() {
    $("modal").classList.add("hidden");
    $("modalContent").innerHTML = "";
}

function message(text) {
    alert(text);
}

async function cacheProfiles(messages) {
    const uids = [
        ...new Set(
            messages
                .map((item) => item.uid)
                .filter(Boolean)
        )
    ];

    await Promise.all(
        uids.map(async (uid) => {
            if (profilesCache.has(uid)) {
                return;
            }

            const snapshot = await getDoc(
                doc(db, "users", uid)
            );

            if (snapshot.exists()) {
                profilesCache.set(
                    uid,
                    snapshot.data()
                );
            }
        })
    );
}

async function openRoom(room) {
    const member = await getMember(
        room.id,
        currentUser.uid
    );

    if (!member) {
        throw new Error(
            "このルームには参加していません。"
        );
    }

    currentRoom = room;
    currentRoomRole = member.role;

    $("currentRoomName").textContent =
        room.name;

    showPage("chat");

    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    unsubscribeMessages =
        watchMessages(
            room.id,
            async (messages) => {
                await cacheProfiles(messages);

                renderMessages(
                    messages,
                    profilesCache
                );
            }
        );
}

async function joinWithCode(code) {
    const result = await joinRoomByCode(
        currentUser,
        code
    );

    if (result.pending) {
        message(
            "参加申請を送信しました。管理者の承認を待ってください。"
        );
        return;
    }

    await loadMemberRooms();
    await openRoom(result.room);
}

async function loadMemberRooms() {
    if (!currentUser) {
        return;
    }

    if (unsubscribeRooms) {
        unsubscribeRooms();
    }

    unsubscribeRooms =
        watchMemberRooms(
            currentUser.uid,
            (rooms) => {
                const container =
                    $("roomList");

                container.innerHTML = "";

                for (const room of rooms) {
                    const item =
                        document.createElement(
                            "div"
                        );

                    item.className =
                        "room-item";

                    const title =
                        document.createElement(
                            "span"
                        );

                    title.textContent =
                        room.name;

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.textContent =
                        "開く";

                    button.onclick =
                        () => openRoom(room)
                            .catch((error) =>
                                message(
                                    error.message
                                )
                            );

                    item.appendChild(title);
                    item.appendChild(button);
                    container.appendChild(item);
                }
            }
        );
}

function renderPublicRooms(rooms) {
    for (const id of [
        "publicRooms",
        "publicRoomsPage"
    ]) {
        const container = $(id);

        if (!container) {
            continue;
        }

        container.innerHTML = "";

        for (const room of rooms) {
            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "public-room-item";

            const info =
                document.createElement(
                    "span"
                );

            info.textContent =
                `${room.name}  [${room.code}]`;

            const button =
                document.createElement(
                    "button"
                );

            button.textContent =
                "参加";

            button.onclick = () => {
                joinWithCode(room.code)
                    .catch((error) =>
                        message(
                            error.message
                        )
                    );
            };

            item.appendChild(info);
            item.appendChild(button);
            container.appendChild(item);
        }
    }
}

async function renderFriends() {
    const container =
        $("friendsList");

    container.innerHTML = "";

    const friends =
        await getFriends(
            currentUser.uid
        );

    for (const friend of friends) {
        const snapshot =
            await getDoc(
                doc(
                    db,
                    "users",
                    friend.uid
                )
            );

        if (!snapshot.exists()) {
            continue;
        }

        const profile =
            snapshot.data();

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "friend-item";

        const name =
            document.createElement(
                "span"
            );

        name.textContent =
            profile.displayName;

        const button =
            document.createElement(
                "button"
            );

        button.textContent =
            "DM";

        button.onclick = async () => {
            await openDM(
                friend.uid,
                profile.displayName
            );
        };

        item.appendChild(name);
        item.appendChild(button);
        container.appendChild(item);
    }

    const requests =
        await getFriendRequests(
            currentUser.uid
        );

    for (const request of requests) {
        const snapshot =
            await getDoc(
                doc(
                    db,
                    "users",
                    request.fromUid
                )
            );

        const profile =
            snapshot.exists()
                ? snapshot.data()
                : {
                    displayName:
                        request.fromUid
                };

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "friend-item";

        const name =
            document.createElement(
                "span"
            );

        name.textContent =
            `申請: ${profile.displayName}`;

        const button =
            document.createElement(
                "button"
            );

        button.textContent =
            "承認";

        button.onclick =
            async () => {
                try {
                    await acceptFriendRequest(
                        request
                    );

                    await renderFriends();
                } catch (error) {
                    message(
                        error.message
                    );
                }
            };

        item.appendChild(name);
        item.appendChild(button);
        container.appendChild(item);
    }
}

async function openDM(
    targetUid,
    targetName
) {
    currentDMThread =
        await ensureDMThread(
            currentUser.uid,
            targetUid
        );

    $("dmTargetName").textContent =
        targetName;

    $("dmChat").classList.remove(
        "hidden"
    );

    watchDM(
        currentDMThread,
        renderDMMessages
    );

    showPage("dm");
}

async function renderDMList() {
    const container =
        $("dmList");

    container.innerHTML =
        "フレンド一覧からDMを開始できます。";

    const friends =
        await getFriends(
            currentUser.uid
        );

    if (!friends.length) {
        return;
    }

    container.innerHTML = "";

    for (const friend of friends) {
        const snapshot =
            await getDoc(
                doc(
                    db,
                    "users",
                    friend.uid
                )
            );

        if (!snapshot.exists()) {
            continue;
        }

        const profile =
            snapshot.data();

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "dm-item";

        const name =
            document.createElement(
                "span"
            );

        name.textContent =
            profile.displayName;

        const button =
            document.createElement(
                "button"
            );

        button.textContent =
            "開く";

        button.onclick =
            () => openDM(
                friend.uid,
                profile.displayName
            );

        item.appendChild(name);
        item.appendChild(button);
        container.appendChild(item);
    }
}

async function showRoomAdminPanel() {
    if (!currentRoom) {
        return;
    }

    const member =
        await getMember(
            currentRoom.id,
            currentUser.uid
        );

    const isAdmin =
        member?.role === "admin"
        || member?.role === "owner";

    let html = `
        <h2>⚙️ ルーム設定</h2>
        <p>ルームコード: <strong>${currentRoom.code}</strong></p>
    `;

    if (!isAdmin) {
        html += `
            <div class="form-row">
                <label>
                    管理者パスワード
                    <input id="adminPasswordInput" type="password">
                </label>
                <button class="primary" id="becomeAdminButton">
                    👑 管理者になる
                </button>
            </div>
        `;
    } else {
        html += `
            <p class="success">
                あなたは ${
                    member.role === "owner"
                        ? "オーナー"
                        : "管理者"
                } です。
            </p>
            <hr>
            <h3>承認待ち</h3>
            <div id="joinRequestList">読み込み中...</div>
            <hr>
            <h3>参加者BAN</h3>
            <div id="memberList">読み込み中...</div>
        `;
    }

    openModal(html);

    if (!isAdmin) {
        $("becomeAdminButton").onclick =
            async () => {
                try {
                    await becomeAdmin(
                        currentRoom,
                        currentUser,
                        $("adminPasswordInput").value
                    );

                    closeModal();
                    message(
                        "管理者になりました！"
                    );

                    await openRoom(
                        currentRoom
                    );
                } catch (error) {
                    message(
                        error.message
                    );
                }
            };

        return;
    }

    await renderAdminLists();
}

async function renderAdminLists() {
    const requests =
        [];

    const requestSnapshot =
        await getDocs(
            collection(
                db,
                "rooms",
                currentRoom.id,
                "joinRequests"
            )
        );

    const requestContainer =
        $("joinRequestList");

    requestContainer.innerHTML = "";

    if (requestSnapshot.empty) {
        requestContainer.textContent =
            "承認待ちはありません。";
    }

    for (const item of requestSnapshot.docs) {
        const data = item.data();

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "room-item";

        row.textContent =
            data.uid;

        const approve =
            document.createElement(
                "button"
            );

        approve.textContent =
            "承認";

        approve.onclick =
            async () => {
                await approveJoin(
                    currentRoom.id,
                    data.uid
                );

                await renderAdminLists();
            };

        const reject =
            document.createElement(
                "button"
            );

        reject.textContent =
            "拒否";

        reject.className =
            "danger";

        reject.onclick =
            async () => {
                await rejectJoin(
                    currentRoom.id,
                    data.uid
                );

                await renderAdminLists();
            };

        row.appendChild(approve);
        row.appendChild(reject);
        requestContainer.appendChild(row);
    }

    const membersSnapshot =
        await getDocs(
            collection(
                db,
                "rooms",
                currentRoom.id,
                "members"
            )
        );

    const memberContainer =
        $("memberList");

    memberContainer.innerHTML = "";

    for (const item of membersSnapshot.docs) {
        const data = item.data();

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "room-item";

        const name =
            document.createElement(
                "span"
            );

        name.textContent =
            `${data.uid} (${data.role})`;

        row.appendChild(name);

        if (
            data.uid !== currentUser.uid
            && data.role !== "admin"
            && data.role !== "owner"
        ) {
            const ban =
                document.createElement(
                    "button"
                );

            ban.textContent =
                "BAN";

            ban.className =
                "danger";

            ban.onclick =
                async () => {
                    try {
                        await banUser(
                            currentRoom,
                            currentUser.uid,
                            data.uid
                        );

                        await renderAdminLists();
                    } catch (error) {
                        message(
                            error.message
                        );
                    }
                };

            row.appendChild(ban);
        }

        memberContainer.appendChild(row);
    }
}

async function initializeAppState() {
    $("connectionStatus").textContent =
        "🟢 接続済み";

    currentProfile =
        await ensureProfile(
            currentUser
        );

    fillProfileForm(
        currentProfile
    );

    startPresence(
        currentUser.uid
    );

    await loadMemberRooms();
    await renderFriends();
    await renderDMList();

    if (unsubscribePublicRooms) {
        unsubscribePublicRooms();
    }

    unsubscribePublicRooms =
        watchPublicRooms(
            renderPublicRooms
        );
}

document
    .querySelectorAll(".nav-button")
    .forEach((button) => {
        button.addEventListener(
            "click",
            async () => {
                showPage(
                    button.dataset.page
                );

                if (
                    button.dataset.page ===
                    "friends"
                ) {
                    await renderFriends();
                }

                if (
                    button.dataset.page ===
                    "dm"
                ) {
                    await renderDMList();
                }
            }
        );
    });

$("profileButton").onclick =
    () => {
        fillProfileForm(
            currentProfile
        );

        showPage("profile");
    };

$("settingsButton").onclick =
    () => {
        showPage("settings");
    };

$("modalClose").onclick =
    closeModal;

$("modal").onclick =
    (event) => {
        if (event.target === $("modal")) {
            closeModal();
        }
    };

$("createRoomButton").onclick =
    async () => {
        try {
            const result =
                await createRoom(
                    currentUser
                );

            if (!result) {
                return;
            }

            await loadMemberRooms();

            const room =
                await getRoomByCode(
                    result.code
                );

            await openRoom(room);

            message(
                `ルームを作成しました！\n\nルームコード: ${result.code}`
            );
        } catch (error) {
            message(
                error.message
            );
        }
    };

$("joinRoomButton").onclick =
    () => {
        const code =
            prompt(
                "ルームコードを入力してください。"
            );

        if (!code) {
            return;
        }

        joinWithCode(code)
            .catch((error) =>
                message(
                    error.message
                )
            );
    };

$("homeJoinButton").onclick =
    () => {
        joinWithCode(
            $("homeRoomCode").value
        ).catch((error) =>
            message(
                error.message
            )
        );
    };

$("joinRoomPageButton").onclick =
    () => {
        joinWithCode(
            $("roomCodeInput").value
        ).catch((error) =>
            message(
                error.message
            )
        );
    };

$("sendButton").onclick =
    async () => {
        if (!currentRoom) {
            return;
        }

        try {
            await sendRoomMessage(
                currentRoom.id,
                currentUser,
                $("messageInput").value,
                currentProfile
            );

            $("messageInput").value = "";
        } catch (error) {
            message(
                error.message
            );
        }
    };

$("messageInput").addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Enter"
            && !event.shiftKey
        ) {
            event.preventDefault();
            $("sendButton").click();
        }
    }
);

$("roomSettingsButton").onclick =
    () => {
        showRoomAdminPanel()
            .catch((error) =>
                message(
                    error.message
                )
            );
    };

$("saveProfileButton").onclick =
    async () => {
        try {
            await saveProfile(
                currentUser.uid
            );

            currentProfile =
                await loadProfile(
                    currentUser.uid
                );

            fillProfileForm(
                currentProfile
            );

            message(
                "プロフィールを保存しました！"
            );
        } catch (error) {
            message(
                error.message
            );
        }
    };

$("friendSearchButton").onclick =
    async () => {
        try {
            const users =
                await searchUsersByName(
                    $("friendSearchInput").value
                );

            const container =
                $("friendResults");

            container.innerHTML = "";

            for (const user of users) {
                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "friend-item";

                const name =
                    document.createElement(
                        "span"
                    );

                name.textContent =
                    user.displayName;

                const button =
                    document.createElement(
                        "button"
                    );

                button.textContent =
                    "フレンド申請";

                button.onclick =
                    async () => {
                        try {
                            await sendFriendRequest(
                                currentUser.uid,
                                user.uid
                            );

                            message(
                                "申請を送りました！"
                            );
                        } catch (error) {
                            message(
                                error.message
                            );
                        }
                    };

                item.appendChild(name);
                item.appendChild(button);
                container.appendChild(item);
            }
        } catch (error) {
            message(
                error.message
            );
        }
    };

$("dmSendButton").onclick =
    async () => {
        if (!currentDMThread) {
            return;
        }

        try {
            await sendDM(
                currentDMThread,
                currentUser.uid,
                $("dmInput").value
            );

            $("dmInput").value = "";
        } catch (error) {
            message(
                error.message
            );
        }
    };

$("stampButton").onclick =
    async () => {
        if (!currentRoom) {
            return;
        }

        const stamps =
            await getStamps(
                currentRoom.id
            );

        const buttons =
            stamps.map(
                (stamp) => `
                    <button
                        class="stamp-choice"
                        data-stamp="${stamp.id}"
                    >
                        ${stamp.text}
                    </button>
                `
            ).join("");

        openModal(`
            <h2>😀 スタンプ</h2>
            <div>${buttons || "スタンプがありません。"}</div>
            <hr>
            <input id="newStampInput" maxlength="20" placeholder="テキストスタンプ">
            <button class="primary" id="addStampButton">
                ＋ 追加
            </button>
        `);

        document
            .querySelectorAll(".stamp-choice")
            .forEach((button) => {
                button.onclick = () => {
                    $("messageInput").value +=
                        button.textContent.trim();

                    closeModal();
                };
            });

        $("addStampButton").onclick =
            async () => {
                try {
                    await addTextStamp(
                        currentRoom.id,
                        currentUser,
                        $("newStampInput").value
                    );

                    closeModal();
                } catch (error) {
                    message(
                        error.message
                    );
                }
            };
    };

$("enableNotificationButton").onclick =
    async () => {
        try {
            await enableNotifications();
            message(
                "通知を許可しました。"
            );
        } catch (error) {
            message(
                error.message
            );
        }
    };

$("streamButton").onclick =
    async () => {
        try {
            const stream =
                await startCamera();

            const video =
                document.createElement(
                    "video"
                );

            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.srcObject = stream;
            video.style.width = "100%";
            video.style.borderRadius = "10px";

            openModal(`
                <h2>🎥 カメラ配信</h2>
                <p>
                    現在はカメラ取得とWebRTC接続の土台です。
                </p>
                <div id="streamVideo"></div>
                <button class="primary" id="stopStreamButton">
                    配信を停止
                </button>
            `);

            $("streamVideo").appendChild(
                video
            );

            $("stopStreamButton").onclick =
                () => {
                    stopCamera();
                    closeModal();
                };
        } catch (error) {
            message(
                error.message
            );
        }
    };

onAuthStateChanged(
    auth,
    async (user) => {
        try {
            if (!user) {
                await ensureAnonymousUser();
                return;
            }

            currentUser = user;

            await initializeAppState();
        } catch (error) {
            console.error(error);

            $("connectionStatus").textContent =
                "🔴 エラー";

            message(
                `YpChatの初期化に失敗しました。\n${error.message}`
            );
        }
    }
);
