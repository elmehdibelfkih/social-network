'use client';
import { useEffect, useState, useRef, FormEvent } from "react";
import styles from "./styles/chat.group.conversation.module.css";
import { chatService } from "@/features/chat/services/chat";
import { ChatMessage } from "./types";
import { formatMessageDate } from "@/libs/helpers";
import { SeenStatus } from "@/components/ui/chats/seen"
import { useDebounceCbf } from "@/libs/debounce";
import AvatarHolder from "@/components/ui/avatar_holder/avatarholder.client";
import { Group } from "../group_card";
import { EmojiIcon, SendIcon, UserPlusIcon } from "@/components/ui/icons";

interface GroupChatConversationProps {
    chatId: number;
    group: Group;
}

export default function GroupChatConversation({ chatId, group }: GroupChatConversationProps) {
    const emojis = [
        "😀", "😂", "😍", "🥰", "😎", "🤔", "😢", "😭", "👍", "👎", "👏", "🙏", "🔥", "❤️", "💔", "✨", "🎉", "🚀", "😡", "😴"
    ];
    const [messages, setMessages] = useState<Map<number, ChatMessage>>(new Map());
    const [oldestMessage, setOldestMessage] = useState<ChatMessage>(null);
    const [lastMessage, setLastMessage] = useState<ChatMessage>(null);
    const [loadingOld, setLoadingOld] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false)
    const [input, setInput] = useState("");
    const [userData, setUserData] = useState(null)
    // const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const emojiBtnRef = useRef<HTMLButtonElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const data = localStorage.getItem("social_network-user");
        if (data) setUserData(JSON.parse(data));
    }, []);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (emojiRef.current?.contains(target)) return;
            if (emojiBtnRef.current?.contains(target)) return;

            setEmojiOpen(false);
        }

        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    useEffect(() => {
        const onUnMount = chatService.addListener((data) => {
            console.log("received from sharedworker:", data);
            if (!data.payload) return
            switch (data.type) {
                case 'chat_message':
                    if (chatId !== data.payload.chatMessage.chatId) return
                    // if (data.payload.chatMessage.senderId != userData.userId) setIsTyping(false)
                    setLastMessage(data.payload.chatMessage)
                    console.log("message", data.payload.chatMessage)
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
                    // setIsTyping(true)
                    break;
                case 'chat_afk':
                    // setIsTyping(false)
                    break;
                default:
                    break;
            }
        })

        return onUnMount;
    }, [userData])

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
        const updatedLast = {
            ...last,
            seenState: "read",
        };
        const resp = await chatService.sendChatSeen(updatedLast, chatId);
        setMessages(prev => {
            const next = new Map(prev);
            const existing = next.get(resp.messageId);
            if (!existing) return prev;
            next.set(resp.messageId, {
                ...existing,
                seenState: resp.seenState,
                updatedAt: resp.updatedAt,
            });
            return next;
        })
    }

    useEffect(() => {
        if (!lastMessage || !userData) return;
        if (lastMessage.senderId !== userData.userId) {
            updateSeen(lastMessage);
        }
    }, [lastMessage, userData]);

    useEffect(() => {
        loadMessages();
    }, [])

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

    function handleEmojiPallete(e: React.MouseEvent) {
        e.preventDefault();
        setEmojiOpen(v => !v);
    }


    function insertEmoji(emoji: string) {
        const el = inputRef.current;
        if (!el) return;

        const start = el.selectionStart ?? input.length;
        const end = el.selectionEnd ?? input.length;

        const next =
            input.slice(0, start) +
            emoji +
            input.slice(end);

        setInput(next);
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(
                start + emoji.length,
                start + emoji.length
            );
        });
    }

    const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
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
                senderData: null
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
                senderData: resp.senderData,
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

    const handleSubmitDebounced = useDebounceCbf(handleSubmitMessage, 100)

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
                <AvatarHolder avatarId={group.avatarId} size={48} />
                <span>{`${group.title}`}</span>
            </div>

            <div className={styles.chatMessages} ref={scrollRef}>
                {Array.from(messages.values())?.map(msg => {
                    return (
                        <div
                            key={msg.messageId}
                            className={`${styles.message} ${msg.senderId == userData.userId ? styles.myMessage : styles.otherMessage}`}
                        >
                            {msg.senderId == userData?.userId ?
                                <AvatarHolder avatarId={userData.avatarId} size={30} /> : <AvatarHolder avatarId={msg.senderData?.avatarId} size={30} />
                            }
                            <div>
                                <div className={styles.messageOwner}>
                                    {msg.senderId == userData?.userId ?
                                        userData?.nickname ?? `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim()
                                        : msg.senderData?.nickname ?? `${msg.senderData?.firstName ?? ""} ${msg.senderData?.lastName ?? ""}`.trim()
                                    }
                                </div>
                                <div className={styles.messageContent}>
                                    {msg.content}
                                </div>
                                <div className={styles.timestamp}>
                                    {formatMessageDate(msg.updatedAt)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.typingContainer}>
                {/* <TypingIndicator isTyping={isTyping} user={user} /> */}
            </div>
            <form className={styles.chatInputContainer} onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    placeholder="Type a message..."
                    onChange={handleInput}
                    className={styles.chatInput}
                    ref={inputRef}
                />
                <button ref={emojiBtnRef} type="button" className={styles.emojiBtn} onClick={handleEmojiPallete}>
                    <EmojiIcon />
                </button>
                <button type="submit" disabled={isLoading} className={styles.sendBtn}>
                    <SendIcon />
                </button>
            </form>

            {emojiOpen && (
                <div ref={emojiRef} className={styles.emojiPalette}>
                    {emojis.map(e => (
                        <button
                            key={e}
                            type="button"
                            onClick={() => insertEmoji(e)}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
