"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import styles from "./styles/chatpopup.module.css";
import ChatConversation from "./chat.conversation.client";

interface FloatingChatProps {
    chatId: number;
    onClose: () => void;
}

export default function FloatingChat({ chatId, onClose }: FloatingChatProps) {
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    useEffect(() => {
        setPortalNode(document.getElementById("chat-portals"));
    }, []);
    if (!portalNode) return null;
    return createPortal(
        <div className={styles.popupStyle}>
            <ChatConversation
                key={chatId}
                chatId={chatId}
                onClose={onClose}
            />
        </div>,
        portalNode
    );
}
