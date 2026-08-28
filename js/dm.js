import {
    db,
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "./firebase.js";

import {
    renderMarkdown
} from "./markdown.js";

let unsubscribe = null;

function threadId(a, b) {
    return [a, b].sort().join("_");
}

export async function ensureDMThread(
    uid,
    targetUid
) {
    const id = threadId(uid, targetUid);

    await setDoc(
        doc(db, "dmThreads", id),
        {
            members: [uid, targetUid],
            updatedAt: serverTimestamp()
        },
        {
            merge: true
        }
    );

    return id;
}

export async function sendDM(
    thread,
    uid,
    text
) {
    const trimmed = text.trim();

    if (!trimmed) {
        return;
    }

    await addDoc(
        collection(
            db,
            "dmThreads",
            thread,
            "messages"
        ),
        {
            uid,
            text: trimmed,
            timestamp: serverTimestamp()
        }
    );

    await setDoc(
        doc(db, "dmThreads", thread),
        {
            updatedAt: serverTimestamp()
        },
        {
            merge: true
        }
    );
}

export function watchDM(
    thread,
    callback
) {
    if (unsubscribe) {
        unsubscribe();
    }

    const q = query(
        collection(
            db,
            "dmThreads",
            thread,
            "messages"
        ),
        orderBy("timestamp", "asc")
    );

    unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            callback(
                snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data()
                }))
            );
        }
    );
}

export function renderDMMessages(
    messages
) {
    const container =
        document.getElementById(
            "dmMessages"
        );

    container.innerHTML = "";

    for (const message of messages) {
        const wrapper =
            document.createElement("div");

        wrapper.className = "message";

        const body =
            document.createElement("div");

        body.className =
            "message-body";

        body.innerHTML =
            renderMarkdown(
                message.text || ""
            );

        wrapper.appendChild(body);
        container.appendChild(wrapper);
    }

    container.scrollTop =
        container.scrollHeight;
}
