'use client';
import { useEffect, useState, useRef, FormEvent } from "react";
import styles from "./styles/chat.conversation.module.css";

interface ChatConversationProps {
    chatId: number;
    onClose: () => void;
}

interface Message {
    id: string;
    text: string;
    sender: "me" | "other";
    timestamp: Date;
}

export default function ChatConversation({ chatId, onClose }: ChatConversationProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage: Message = {
            id: `${Date.now()}`,
            text: input,
            sender: "me",
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInput("");
    };

    return (
        <div className={styles.chatContainer}>

            <div className={styles.chatHeader}>
                <span>Chat {chatId}</span>
                <button className={styles.closeBtn} onClick={onClose}>X</button>
            </div>

            <div className={styles.chatMessages} ref={scrollRef}>
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`${styles.message} ${msg.sender === "me" ? styles.myMessage : styles.otherMessage}`}
                    >
                        {msg.text}
                        <div className={styles.timestamp}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
            </div>

            <form className={styles.chatInputContainer} onSubmit={handleSend}>
                <input
                    type="text"
                    value={input}
                    placeholder="Type a message..."
                    onChange={(e) => setInput(e.target.value)}
                    className={styles.chatInput}
                />
                <button type="submit" className={styles.sendBtn}>Send</button>
            </form>
        </div>
    );
}
