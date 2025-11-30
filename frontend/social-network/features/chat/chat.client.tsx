'use client';
import { useState, useEffect } from 'react';
import { User } from './types';
import { chatService } from './services/chat';
import styles from './styles.module.css';
import ChatCard from './chat.card.client';

export function ChatSection() {
    const [users, setUsers] = useState<User[] | null>(null);
    useEffect(() => {
        const port = chatService.getGlobalPort();
        if (!port) return;

        port.onmessage = (e) => {
            const data = e.data;
            console.log("received from sharedworker:", data);
            setUsers(data?.payload?.onlineStatus)
        };
        port.postMessage(JSON.stringify({ source: 'client', type: 'online_status', payload: null }));
    }, []);
    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                {/* <img src="/svg/users.svg" alt="" /> */}
                <h2>Contacts</h2>
            </div>
            <div className={styles.scrollArea}>
                {   
                    users?.map((u) => (
                        <ChatCard
                            key={u.UserId}
                            profileImage={
                                u.AvatarId ? "/svg/users.svg" : "/svg/users.svg"
                            }
                            firstName={u.FirstName}
                            lastName={u.LastName}
                            nickname={u.Nickname ?? ""}
                            isOnline={u.Online}
                        />
                    ))}
            </div>
        </div>
    );
};