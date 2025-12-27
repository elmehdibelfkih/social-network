'use client';
import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { User } from './types';
import { chatService } from './services/chat';

type ChatProviderState = {
    openChats: Map<number, User>;
    setOpenChats: (u: ChatProviderState['openChats']) => void;
    users: User[];
    setUsers: (u: ChatProviderState['users']) => void;
    handleOpenChat: (chatId: number, users: User) => void;
    handleCloseChat: (chatId: number) => void;
    handleCloseAll: () => void;
};

const ChatContext = createContext<ChatProviderState | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [openChats, setOpenChats] = useState<Map<number, User>>(new Map());
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
    }, [openChats, users])

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
    };

    useEffect(() => {

        const onUnMount = chatService.addListener((data) => {
            console.log("received from sharedworker:", data.type, data);
            switch (data.type) {
                case 'online_status': {
                    const onlineUsers = data.payload.onlineStatus.onlineUsers;
                    setUsers(onlineUsers);
                    setOpenChats(prev => {
                        const allowedIds = new Set(onlineUsers.map(u => u.chatId));
                        const next = new Map(prev);
                        for (const [chatId, user] of next) {
                            if (!allowedIds.has(user.chatId)) {
                                next.delete(chatId);
                            }
                        }
                        return next;
                    });
                    break;
                }
                case 'onlineUser': {
                    const updated = data?.payload?.onlineUser.user;
                    setUsers(prev =>
                        prev?.map(u =>
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
                        prev?.map(u =>
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

    const value = useMemo(() => ({
        openChats,
        setOpenChats,
        users,
        setUsers,
        handleOpenChat,
        handleCloseChat,
        handleCloseAll,
    }), [openChats, users]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};


export function useChatProviderState() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useAppState must be used inside AppProvider');
    return ctx;
}
