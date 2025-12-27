'use client';
import styles from './styles/styles.module.css';
import ChatCard from './chat.card.client';
import FloatingChat from './chat.popup.client';
import { MessageSquareIcon } from '@/components/ui/icons';
import { useChatProviderState } from './global.chat.client';
import { useEffect } from 'react';

export function ChatPortals() {
    const { openChats,
        setOpenChats,
        users,
        setUsers,
        handleOpenChat,
        handleCloseChat,
        handleCloseAll
    } = useChatProviderState()

    return (
        <div id="chat-portals">
            {Array.from(openChats.entries()).map(([chatId, user]) => (
                <FloatingChat
                    key={chatId}
                    chatId={chatId}
                    user={user}
                    onClose={() => handleCloseChat(chatId)}
                />
            ))}
        </div>
    );
};