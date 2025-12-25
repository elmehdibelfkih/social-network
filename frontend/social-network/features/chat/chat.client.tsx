'use client';
import styles from './styles/styles.module.css';
import ChatCard from './chat.card.client';
import FloatingChat from './chat.popup.client';
import { MessageSquareIcon } from '@/components/ui/icons';
import { useChatProviderState } from './global.chat.client';

export function ChatSection() {
    const { openChats,
        setOpenChats,
        users,
        setUsers,
        handleOpenChat,
        handleCloseChat,
        handleCloseAll
    } = useChatProviderState()


    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div className={styles.banner}>
                    <MessageSquareIcon />
                    <h2>Chats</h2>
                </div>
                <button className={styles.closeAll} onClick={handleCloseAll}>
                    <img src="/svg/x.svg" alt="" />
                </button>
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
            </div>
        </div>
    );
};