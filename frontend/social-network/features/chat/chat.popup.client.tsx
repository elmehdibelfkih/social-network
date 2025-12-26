"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import styles from "./styles/chatpopup.module.css";
import ChatConversation from "./chat.conversation.client";
import { User } from "./types";

interface FloatingChatProps {
    chatId: number;
    user: User;
    onClose?: () => void;
}

export default function FloatingChat({ chatId, user, onClose }: FloatingChatProps) {
    // const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    // useEffect(() => {
    //     console.log("effect trigred")
    //     setPortalNode(document.getElementById("chat-portals"));
    // }, []);
    // if (!portalNode) return null;
    return (
        <div className={styles.popupStyle}>
            <ChatConversation
                key={chatId}
                chatId={chatId}
                user={user}
                onClose={onClose}
            />
        </div>
    );
}
