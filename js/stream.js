let localStream = null;
let peerConnections = new Map();

export async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
            "このブラウザではカメラを利用できません。"
        );
    }

    localStream =
        await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

    return localStream;
}

export function getLocalStream() {
    return localStream;
}

export function stopCamera() {
    if (!localStream) {
        return;
    }

    for (const track of localStream.getTracks()) {
        track.stop();
    }

    localStream = null;
}

export function createPeerConnection(
    id,
    onTrack
) {
    const pc =
        new RTCPeerConnection({
            iceServers: [
                {
                    urls:
                        "stun:stun.l.google.com:19302"
                }
            ]
        });

    if (localStream) {
        for (const track of localStream.getTracks()) {
            pc.addTrack(
                track,
                localStream
            );
        }
    }

    pc.ontrack = onTrack;
    peerConnections.set(id, pc);

    return pc;
}

export function closePeerConnection(id) {
    const pc =
        peerConnections.get(id);

    if (pc) {
        pc.close();
        peerConnections.delete(id);
    }
}

export function closeAllConnections() {
    for (const pc of peerConnections.values()) {
        pc.close();
    }

    peerConnections.clear();
}
