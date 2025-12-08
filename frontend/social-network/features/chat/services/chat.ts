import { http } from "@/libs/apiFetch";
import { ChatMessage, MarkSeen, messagesList, SocketMessage } from "../types";

let globalPort: MessagePort | null = null;

type Listener = (data: SocketMessage) => void

class ChatService {

    private port: MessagePort | null = null;
    private listeners: Set<Listener> = new Set();
    private worker: SharedWorker = null;

    initPort(): MessagePort {

        if (!this.worker) {
            this.worker = new SharedWorker("/shared_worker.js");
            this.worker.port.start();

            this.worker.port.onmessage = (event: MessageEvent) => {
                const data: SocketMessage = event.data;
                this.listeners.forEach(fn => fn(data));
            };
        }

        this.port = this.worker.port;
        return this.port;

    }

    addListener(fn: Listener) {
        this.listeners.add(fn);
        return () => {
            this.listeners.delete(fn);
        }
    }

    sendToWorker(data: SocketMessage) {
        if (!this.port) this.initPort();
        console.log(data)
        this.port!.postMessage(data)
    }

    getGlobalPort(): MessagePort | null {
        return globalPort
    }

    async sendChatMessage(data: ChatMessage, chatId: number): Promise<ChatMessage> {
        return http.post<ChatMessage>(`/api/v1/chats/${chatId}/messages`, data)
    }

    async sendChatSeen(data: MarkSeen, chatId: number): Promise<MarkSeen> {
        return http.put<MarkSeen>(`/api/v1/chats/${chatId}/messages`, data)
    }

    async chatHistory(chatId: number, messageId: number = 0): Promise<messagesList> {
        return http.get<messagesList>(`/api/v1/chats/${chatId}/messages/${messageId}`)
    }
}

export const chatService = new ChatService();