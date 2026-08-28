export async function enableNotifications() {
    if (!("Notification" in window)) {
        throw new Error(
            "このブラウザは通知に対応していません。"
        );
    }

    const permission =
        await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error(
            "通知が許可されませんでした。"
        );
    }

    if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register(
            "./sw.js"
        );
    }

    return true;
}
