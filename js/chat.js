import {
    db,
    collection,
    doc,
    addDoc,
    getDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "./firebase.js";

import {
    renderMarkdown
} from "./markdown.js";

let unsubscribeMessages = null;

export function watchMessages(
    roomId,
    onMessages
) {
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    const q = query(
        collection(
            db,
            "rooms",
            roomId,
            "messages"
        ),
        orderBy("timestamp", "asc")
    );

    unsubscribeMessages = onSnapshot(
        q,
        (snapshot) => {
            const messages = snapshot.docs.map(
                (item) => ({
                    id: item.id,
                    ...item.data()
                })
            );

            onMessages(messages);
        }
    );

    return () => {
        if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }
    };
}

export function renderMessages(
    messages,
    profiles
) {
    const container = document.getElementById(
        "messages"
    );

    container.innerHTML = "";

    for (const message of messages) {
        const profile =
            profiles.get(message.uid) || {};

        const wrapper =
            document.createElement("div");

        wrapper.className = "message";

        const name =
            document.createElement("span");

        name.className = "message-name";
        name.textContent =
            message.displayName || "Unknown";

        name.style.background =
            profile.plateColor || "#3b82f6";

        const time =
            document.createElement("span");

        time.className = "message-time";

        if (message.timestamp?.toDate) {
            time.textContent =
                message.timestamp.toDate()
                    .toLocaleTimeString(
                        "ja-JP",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );
        }

        const body =
            document.createElement("div");

        body.className = "message-body";

        body.innerHTML =
            renderMarkdown(
                message.text || ""
            );

        if (profile.font) {
            body.style.fontFamily =
                profile.font === "system"
                    ? "system-ui, sans-serif"
                    : profile.font;
        }

        wrapper.appendChild(name);
        wrapper.appendChild(time);
        wrapper.appendChild(body);

        container.appendChild(wrapper);
    }

    container.scrollTop =
        container.scrollHeight;
}

export async function sendRoomMessage(
    roomId,
    user,
    text,
    profile
) {
    const trimmed = text.trim();

    if (!trimmed) {
        return;
    }

    await addDoc(
        collection(
            db,
            "rooms",
            roomId,
            "messages"
        ),
        {
            uid: user.uid,
            displayName: profile.displayName,
            text: trimmed,
            timestamp: serverTimestamp()
        }
    );
}
