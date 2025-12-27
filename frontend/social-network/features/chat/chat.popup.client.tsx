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
