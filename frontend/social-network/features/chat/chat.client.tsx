'use client';
import { useState, useEffect } from 'react';
import { User } from './types';
import { chatService } from './services/chat';
import styles from './styles/styles.module.css';
import ChatCard from './chat.card.client';
import FloatingChat from './chat.popup.client';

export function ChatSection() {
    const [openChats, setOpenChats] = useState<number[]>([]);
    const handleOpenChat = (chatId: number) => {
        setOpenChats(prev => {
            if (prev.includes(chatId)) return prev;
            if (prev.length < 3) return [...prev, chatId];
            return [...prev.slice(1), chatId];
        });
    };
    const handleCloseChat = (chatId: number) => {
        setOpenChats(prev => prev.filter(id => id !== chatId));
    };

    const handleCloseAll = () => {
        setOpenChats([]);
    }


    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => {
        const port = chatService.getGlobalPort();
        if (!port) return;

        port.onmessage = (e) => {
            const data = e.data;
            console.log("received from sharedworker:", data);
            switch (data.type) {
                case 'online_status':
                    setUsers(data?.payload?.onlineStatus.onlineUsers)
                    break;
                case 'onlineUser': {
                    const updated = data?.payload?.onlineUser.user;
                    setUsers(prev => prev.map(u => u.userId === updated.userId ? { ...updated } : u));
                    break;
                }
                case 'offlineUser': {
                    const updated = data?.payload?.offlineUser.user;
                    setUsers(prev => prev.map(u => u.userId === updated.userId ? { ...updated } : u));
                    break;
                }
                default:
                    break;
            }
            // console.log(users)
        };
        port.postMessage(JSON.stringify({ source: 'client', type: 'online_status', payload: null }));
    }, []);
    useEffect(() => {
        console.log("users state has been changed", users)
    }, [users])
    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                {/* <img src="/svg/users.svg" alt="" /> */}
                <h2>Contacts</h2>
            </div>
            <div className={styles.scrollArea}>
                {users?.map((u) => (
                    <ChatCard
                        key={u.userId}
                        chatId={u.chatId}
                        unreadCount={u.unreadCount}
                        profileImage={
                            u.avatarId ? "/svg/users.svg" : "/svg/users.svg"
                        }
                        firstName={u.firstName}
                        lastName={u.lastName}
                        nickname={u.nickname ?? ""}
                        isOnline={u.online}
                        onClick={handleOpenChat}
                    />
                ))}
                <button onClick={handleCloseAll}>
                    <img src="/svg/x.svg" alt="" />
                </button>
                {openChats.map(chatId => (
                    <FloatingChat
                        key={chatId}
                        chatId={chatId}
                        onClose={() => handleCloseChat(chatId)}
                    />
                ))}

            </div>
        </div>
    );
};