'use client';
import { useEffect, useState, useRef, FormEvent } from "react";
import styles from "./styles/chat.conversation.module.css";
import { chatService } from "@/features/chat/services/chat";
import { ChatMessage } from "./types";
import { formatMessageDate } from "@/libs/helpers";
import { SeenStatus } from "@/components/ui/chats/seen"

interface ChatConversationProps {
    chatId: number;
    onClose: () => void;
}

export default function ChatConversation({ chatId, onClose }: ChatConversationProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingOld, setLoadingOld] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false)
    const [input, setInput] = useState("");
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("social_network-user")))
    const [isTyping, setIsTyping] = useState(false)
    const [isAfk, setIsAfk] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onUnMount = chatService.addListener((data) => {
            console.log("received from sharedworker:", data);
            if (!data.payload) return
            switch (data.type) {
                case 'chat_message':
                    setMessages(prev => [...prev, data.payload.chatMessage])
                    break;
                case 'chat_seen':
                    setMessages(prev =>
                        prev.map(msg => {
                            if (msg.messageId === data.payload.markSeen.messageId) {
                                return {
                                    ...msg,
                                    seenState: data.payload.markSeen.seenState,
                                };
                            }
                            return msg;
                        })
                    );
                    break;
                case 'chat_typing':
                    setIsTyping(true)
                    break;
                case 'chat_afk':
                    setIsAfk(true)
                    break;
                default:
                    break;
            }
        })

        return onUnMount;
    }, [])

    async function loadOlderMessages() {
        if (loadingOld || !hasMore) return;
        const div = scrollRef.current;
        if (!div) return;
        setLoadingOld(true);

        const prevScrollHeight = div.scrollHeight;
        const oldest = messages[0];
        const beforeId = oldest?.messageId;

        const resp = await chatService.chatHistory(chatId, beforeId);
        if (!resp.messagesList) {
            setHasMore(false);
            setLoadingOld(false);
            return;
        }
        const reversed = resp.messagesList.reverse()

        setMessages(prev => [...reversed, ...prev]);

        requestAnimationFrame(() => {
            const newScrollHeight = div.scrollHeight;
            div.scrollTop = newScrollHeight - prevScrollHeight;
        });


        setLoadingOld(false);
    }

    useEffect(() => {
        const div = scrollRef.current;
        if (!div) return;

        function onScroll() {
            if (div.scrollTop <= 0) {
                loadOlderMessages();
            }
        }

        if (messages.length !== 0) {
            const last = messages[messages.length - 1];
            if (last.senderId != userData.userId && last.seenState !== "read") {
                updateSeen(last);
            }
        }

        div.addEventListener("scroll", onScroll);
        return () => div.removeEventListener("scroll", onScroll);
    }, [messages, hasMore, loadingOld]);

    async function updateSeen(last: ChatMessage) {
        last.seenState = "read"
        const resp = await chatService.sendChatSeen(last, chatId);
        const chatSeenResponse = {
            messageId: resp.messageId,
            chatId: resp.chatId,
            senderId: resp.senderId,
            content: resp.content,
            seenState: resp.seenState,
            createdAt: resp.createdAt,
            updatedAt: resp.updatedAt,
        };
        setMessages(() => {
            if (chatSeenResponse.seenState === "read") return messages.map(msg => {
                if (msg.senderId != userData.userId) msg.seenState = "read"
                return msg
            })
            return messages
        })

    }

    useEffect(() => {
        loadMessages();
    }, [chatId])

    async function loadMessages() {
        try {
            const resp = await chatService.chatHistory(chatId);
            if (!resp.messagesList) return
            setMessages(resp.messagesList.reverse() || [])
            setTimeout(() => {
                const div = scrollRef.current;
                if (div) div.scrollTop = div.scrollHeight;
            }, 0);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }


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
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight; // scoll down after submiting a msg
                })
            })
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
                <button className={styles.closeBtn} onClick={onClose}>
                    <img src="/svg/x.svg" alt="" />
                </button>
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
                                <SeenStatus state={msg.seenState}></SeenStatus>
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
