import { WebSocketMessage } from "./types";

let worker: SharedWorker | null = null;


function initWorker() {
    if (typeof window === "undefined") return null;
    if (!("SharedWorker" in window)) return null;
    if (worker) return worker;

    worker = new SharedWorker("/shared_worker.js");
    worker.port.start();

    worker.port.onmessage = (e) => {
        console.log("Worker message:", e.data);
    };
    return worker;
}

export function sendMessage<T>(json: WebSocketMessage<T>) {
    const w = initWorker();
    if (!w) return;
    w.port.postMessage(json);
}

const channel = typeof window !== "undefined" ? new BroadcastChannel("ws_channel") : null;

export function broadcastToTabs(msg: string) {
    channel?.postMessage(msg);
}

if (channel) {
    channel.onmessage = (e) => {
        console.log("Broadcast message:", e.data);
    };
}
