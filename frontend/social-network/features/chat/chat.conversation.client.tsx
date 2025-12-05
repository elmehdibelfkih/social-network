'use client';
import { useEffect, useState, useRef, FormEvent } from "react";
import styles from "./styles/chat.conversation.module.css";
import { chatService } from "@/features/chat/services/chat";
import { ChatMessage } from "./types";
import { formatMessageDate } from "@/libs/helpers";

interface ChatConversationProps {
    chatId: number;
    onClose: () => void;
}

export default function ChatConversation({ chatId, onClose }: ChatConversationProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    const [input, setInput] = useState("");
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("social_network-user")))
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        async function loadMessages() {
            try {
                const resp = await chatService.chatHistory(chatId)
                console.log(resp.messagesList)
                setMessages(resp.messagesList)
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
        loadMessages();
    }, [chatId])


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            setUserData(JSON.parse(localStorage.getItem("social_network-user")))
            const chatMessage = {
                messageId: 0,
                chatId: chatId,
                senderId: Number(userData.userId),
                content: input,
                seenState: 'sent',
                createdAt: Date.now().toString(),
                updatedAt: Date.now().toString(),
            }
            const resp = await chatService.sendChatMessage(chatMessage, chatId);
            const chatMessageResponse = {
                messageId: resp.messageId,
                chatId: resp.chatId,
                senderId: resp.senderId,
                content: resp.content,
                seenState: resp.seenState,
                createdAt: resp.createdAt,
                updatedAt: resp.updatedAt,
            };
            setMessages(prev => [...prev, chatMessageResponse]);
            setInput("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className={styles.chatContainer}>

            <div className={styles.chatHeader}>
                <span>Chat {chatId}</span>
                <button className={styles.closeBtn} onClick={onClose}>X</button>
            </div>

            <div className={styles.chatMessages} ref={scrollRef}>
                {messages?.map(msg => {
                    return (
                        <div
                            key={msg.messageId}
                            className={`${styles.message} ${msg.senderId == userData.userId ? styles.myMessage : styles.otherMessage}`}
                        >

                            {msg.content}
                            <div className={styles.timestamp}>
                                {formatMessageDate(msg.updatedAt)}
                            </div>
                        </div>
                    );
                })}
            </div>

            <form className={styles.chatInputContainer} onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    placeholder="Type a message..."
                    onChange={(e) => setInput(e.target.value)}
                    className={styles.chatInput}
                />
                <button type="submit"
                    disabled={isLoading}
                    className={styles.sendBtn}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
