'use client';
import { useState, useEffect } from 'react';
import { User } from './types';
import { chatService } from './services/chat';
import styles from './styles/styles.module.css';
import ChatCard from './chat.card.client';
import FloatingChat from './chat.popup.client';

export function ChatSection() {
    const [openChats, setOpenChats] = useState<Map<number, User>>(new Map());
    const [users, setUsers] = useState<User[]>([]);

    const handleOpenChat = (chatId: number, users: User) => {
        setOpenChats(prev => {
            const next = new Map(prev);
            next.set(chatId, users);

            if (next.size > 3) {
                const firstKey = next.keys().next().value;
                next.delete(firstKey);
            }

            return next;
        });
    };

    const handleCloseChat = (chatId: number) => {
        setOpenChats(prev => {
            const next = new Map(prev);
            next.delete(chatId);
            return next;
        });
    };

    const handleCloseAll = () => {
        setOpenChats(new Map());
    }

    useEffect(() => {

        const onUnMount = chatService.addListener((data) => {
            console.log("received from sharedworker:", data);
            console.log(data.type);
            switch (data.type) {
                case 'online_status':
                    setUsers(data?.payload?.onlineStatus.onlineUsers)
                    break;
                case 'onlineUser': {
                    const updated = data?.payload?.onlineUser.user;
                    setUsers(prev =>
                        prev.map(u =>
                            u.userId === updated.userId
                                ? { ...u, online: updated.online }
                                : u
                        )
                    );
                    break;
                }
                case 'offlineUser': {
                    const updated = data?.payload?.offlineUser.user;
                    setUsers(prev =>
                        prev.map(u =>
                            u.userId === updated.userId
                                ? { ...u, online: updated.online }
                                : u
                        )
                    );
                    break;
                }
                default:
                    break;
            }
        })

        chatService.sendToWorker({ source: 'client', type: 'online_status', payload: null });

        return onUnMount;
    }, []);
    // useEffect(() => {
    //     console.log("chat changed", openChats)
    // }, [openChats])
    // useEffect(() => {
    //     console.log("users changed", users)
    // }, [users])
    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <img src="/svg/message-square.svg" alt="" />
                <h2>Contacts</h2>
            </div>
            <div className={styles.scrollArea}>
                {users?.map((u) => (
                    <ChatCard
                        key={u.userId}
                        chatId={u.chatId}
                        user={u}
                        onClick={handleOpenChat}
                    />
                ))}
                <button onClick={handleCloseAll}>
                    <img src="/svg/x.svg" alt="" />
                </button>
                {Array.from(openChats.entries()).map(([chatId, user]) => (
                    <FloatingChat
                        key={chatId}
                        chatId={chatId}
                        user={user}
                        onClose={() => handleCloseChat(chatId)}
                    />
                ))}
            </div>
        </div>
    );
};