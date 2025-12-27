
class WebSocketManger {

    constructor() {
        this.ws = null;
        this.ports = [];
        this.url = "ws://localhost:8080/ws"; // i think this should be an env var
        this.reconnectDelay = 5000;
        this.reconnectTimer = null;
        this.messagesQueue = []
    }

    #initWebsocket() {
        if (this.ws) return // already has websocket
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("ws connection opened")
            this.#burstQueue();
            clearInterval(this.reconnectTimer)
            this.reconnectTimer = null;
        }
        this.ws.onmessage = (e) => {
            console.log("recieved from server", JSON.parse(e.data))
            this.#broadcast(e.data)
        }
        this.ws.onerror = (err) => {
            console.log("ws error", err)
            this.ws?.close()
        }
        this.ws.onclose = () => {
            console.log("closing websocket")
            this.#broadcast(JSON.stringify({ source: "shared_worker", type: "websocket_close", payload: null }))
            this.ws = null;
            this.#tryReconnect();
        }
    }

    #broadcast(data) {
        const alivePorts = []
        for (const p of this.ports) {
            try {
                p.postMessage(JSON.parse(data));
                alivePorts.push(p)
            } catch {
                console.warn("dead port found!")
            }
        }
        this.ports = alivePorts
    }

    #tryReconnect() {
        if (this.reconnectTimer) return // we are already trying o reconnect 
        console.log("reconnecting to ws...")
        this.reconnectTimer = setInterval(() => {
            this.#initWebsocket()
            if (this.ws && this.ws.readyState == WebSocket.OPEN) this.#sendOrQueue({ source: "shared_worker", type: "reconnect" })
        }, this.reconnectDelay)
    }

    #removePort(port) {
        this.ports = this.ports.filter(p => p !== port);
    }

    #validatePort(port) {
        try {
            port.postMessage("ping");
            return true;
        } catch {
            this.#removePort(port);
            return false;
        }
    }

    #attachPortHandlers(port) {
        port.onmessage = (e) => {
            if (e.data.type === "init_ws") {
                this.#initWebsocket();
                return;
            }
            console.log("data we are about to send", e.data)
            this.#sendOrQueue(e.data);
        };
    }

    #sendOrQueue(data) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.messagesQueue.push(JSON.stringify(data))
            console.log("hold on queue:", this.messagesQueue)
            return
        }
        this.ws.send(JSON.stringify(data))
    }

    #burstQueue() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        for (const msg of this.messagesQueue) {
            this.ws.send(msg);
        }
        this.messagesQueue = []
    }

    addPort(port) {
        if (!this.#validatePort(port)) return;
        this.ports.push(port);
        this.#attachPortHandlers(port);
    }
}

const manager = new WebSocketManger();

onconnect = function (e) {
    const port = e.ports[0];
    manager.addPort(port);
};