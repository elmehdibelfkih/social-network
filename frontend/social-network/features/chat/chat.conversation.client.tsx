'use client';
import { useEffect, useState, useRef, FormEvent } from "react";
import styles from "./styles/chat.conversation.module.css";
import { chatService } from "@/features/chat/services/chat";
import { ChatMessage } from "./types";
import { formatMessageDate } from "@/libs/helpers";
import { SeenStatus } from "@/components/ui/chats/seen"
import { useDebounce, useDebounceCbf } from "@/libs/debounce";

interface ChatConversationProps {
    chatId: number;
    onClose: () => void;
}

export default function ChatConversation({ chatId, onClose }: ChatConversationProps) {
    const [messages, setMessages] = useState<Map<number, ChatMessage>>(new Map());
    const [oldestMessage, setOldestMessage] = useState<ChatMessage>(null);
    const [lastMessage, setLastMessage] = useState<ChatMessage>(null);
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
                    if (chatId !== data.payload.chatMessage.chatId) return
                    setLastMessage(data.payload.chatMessage)
                    setMessages(prev => {
                        const next = new Map(prev);
                        next.set(data.payload.chatMessage.messageId, data.payload.chatMessage);
                        return next;
                    })
                    break;
                case 'chat_seen':
                    if (chatId !== data.payload.markSeen.chatId) return
                    setMessages(prev => {
                        const next = new Map(prev);
                        const msgId = data.payload.markSeen.messageId;
                        const oldMsg = next.get(msgId);
                        if (!oldMsg) return prev;

                        const updated = {
                            ...oldMsg,
                            seenState: data.payload.markSeen.seenState
                        };
                        next.set(msgId, updated);
                        return next;
                    });
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
        console.log(oldestMessage)
        console.log(lastMessage)
        if (loadingOld || !hasMore) return;
        const div = scrollRef.current;
        if (!div) return;
        setLoadingOld(true);
        const prevScrollHeight = div.scrollHeight;

        const resp = await chatService.chatHistory(chatId, oldestMessage.messageId);
        if (!resp.messagesList) {
            setHasMore(false);
            setLoadingOld(false);
            return;
        }
        const list = resp.messagesList
        setOldestMessage(list[list.length - 1])
        setMessages(prev => {
            const next = new Map(prev);
            for (const msg of list) {
                if (!next.has(msg.messageId)) {
                    const temp = new Map<number, ChatMessage>();
                    temp.set(msg.messageId, msg);
                    next.forEach((v, k) => temp.set(k, v));
                    next.clear();
                    temp.forEach((v, k) => next.set(k, v));
                }
            }
            return next;
        });

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

        div.addEventListener("scroll", onScroll);
        return () => div.removeEventListener("scroll", onScroll);
    }, [messages, hasMore, loadingOld]);

    async function updateSeen(last: ChatMessage) {
        last.seenState = "read"
        const resp = await chatService.sendChatSeen(last, chatId);
        console.log("from backend", resp)
        const chatSeenResponse = {
            messageId: resp.messageId,
            chatId: resp.chatId,
            senderId: last.senderId,
            content: resp.content,
            seenState: resp.seenState,
            createdAt: resp.createdAt,
            updatedAt: resp.updatedAt,
        };
        setMessages(prev => {
            const next = new Map(prev);
            next.set(chatSeenResponse.messageId, chatSeenResponse);
            return next;
        })
    }

    useEffect(() => {
        console.log("last message", lastMessage)
        if (!lastMessage) return
        console.log(lastMessage.senderId != userData.userId)
        if (lastMessage.senderId != userData.userId) {
            updateSeen(lastMessage)
        }
    }, [lastMessage])

    useEffect(() => {
        loadMessages();
    }, [chatId])

    async function loadMessages() {
        try {
            const resp = await chatService.chatHistory(chatId);
            if (!resp.messagesList) return
            console.log(resp.messagesList)
            const corrected = resp.messagesList.reverse()
            const keyValuePairs: [number, ChatMessage][] = corrected.map(obj => [obj.messageId, obj]);
            const history: Map<number, ChatMessage> = new Map<number, ChatMessage>(keyValuePairs);
            setMessages(history);
            setOldestMessage(corrected[0])
            setLastMessage(corrected[corrected.length - 1])
            setTimeout(() => {
                const div = scrollRef.current;
                if (div) div.scrollTop = div.scrollHeight;
            }, 0);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }


    const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("onsubmit")
        if (!input) return
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
            setLastMessage(chatMessageResponse)
            setMessages(prev => {
                const next = new Map(prev);
                next.set(chatMessageResponse.messageId, chatMessageResponse);
                return next;
            })
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

    const handleSubmitDebounced = useDebounceCbf(handleSubmitMessage, 200)

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmitDebounced(e);
    }

    return (
        <div className={styles.chatContainer}>

            <div className={styles.chatHeader}>
                <span>Chat {chatId}</span>
                <button className={styles.closeBtn} onClick={onClose}>
                    <img src="/svg/x.svg" alt="" />
                </button>
            </div>

            <div className={styles.chatMessages} ref={scrollRef}>
                {Array.from(messages.values())?.map(msg => {
                    return (
                        <div
                            key={msg.messageId}
                            className={`${styles.message} ${msg.senderId == userData.userId ? styles.myMessage : styles.otherMessage}`}
                        >
                            {msg.content}
                            <div className={styles.timestamp}>
                                <SeenStatus state={msg.seenState} time={formatMessageDate(msg.updatedAt)}></SeenStatus>
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
                    onChange={handleInput}
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
