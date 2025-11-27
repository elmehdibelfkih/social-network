'use client';
import { useState, useEffect, useRef } from 'react';
import { User } from './types';
import { chatService } from './services/chat';
import styles from './styles.module.css';

export function ChatSection() {
    useEffect(() => {
        const port = chatService.getGlobalPort();
        if (!port) return;

        port.onmessage = (e) => {
            const data = e.data;
            console.log("received from sharedworker:", data);
        };
        port.postMessage(JSON.stringify({ source: 'client', type: 'online_status', payload: null }));
    }, []);
    const [users, useUsersState] = useState([] as User[]);
    return (
        <div>
            <h2>contacts</h2>
            <div className={styles.onlineSection}>
                <div>
                    <img src="" alt="" />
                </div>
            </div>
            <div className={styles.offlineSection}>
                <div>
                    <img src="" alt="" />
                </div>
            </div>
        </div>
    );
};