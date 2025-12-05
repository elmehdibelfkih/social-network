import { http } from "@/libs/apiFetch";
import { ChatMessage, MarkSeen, messagesList } from "../types";

let globalPort: MessagePort | null = null;

export const chatService = {

    initSharedWorker(): MessagePort {
        if (!globalPort) {
            const worker = new SharedWorker('/shared_worker.js')
            globalPort = worker.port
            globalPort.start()
        }
        return globalPort
    },

    getGlobalPort(): MessagePort | null {
        return globalPort
    },

    async sendChatMessage(data: ChatMessage, chatId: number): Promise<ChatMessage> {
        return http.post<ChatMessage>(`/api/v1/chats/${chatId}/messages`, data)
    },

    async sendChatSeen(data: MarkSeen, chatId: number): Promise<MarkSeen> {
        return http.put<MarkSeen>(`/api/v1/chats/${chatId}/messages`, data)
    },

    async chatHistory(chatId: number, messageId: number = 0): Promise<messagesList> {
        return http.get<messagesList>(`/api/v1/chats/${chatId}/messages/${messageId}`)
    },
}