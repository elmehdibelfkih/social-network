
'use client'

import React from "react";
import styles from "./styles/typing.module.css";
import { User } from "./types";

export interface TypingIndicatorProps {
    isTyping: boolean;
    user: User;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
    isTyping,
    user,
}) => {
    return (
        <div className={`${styles.typing} ${isTyping ? "" : styles.hide}`}>
            <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div className={styles.typingData}>
                <div className={styles.username}>{user.firstName}</div>
                <p> is typing...</p>
            </div>
        </div>
    );
};

export default TypingIndicator;
