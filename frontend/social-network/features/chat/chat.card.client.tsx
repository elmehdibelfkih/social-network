'use client'

import React from "react";
import styles from "./styles/chatcard.module.css";
import { User } from "./types";
import { ChatImage } from "./chat.avatar.client";

export interface ChatContactProps {
  chatId: number;
  user: User;
  onClick: (chatId: number, users: User) => void;
}

export const ChatCard: React.FC<ChatContactProps> = ({
  chatId,
  user,
  onClick,
}) => {
  return (
    <div
      className={`${styles.contactItem} ${user.online ? styles.online : styles.offline}`} onClick={() => onClick(chatId, user)} >
      <div className={styles.avatar}>
        <ChatImage mediaId={user.avatarId} />
      </div>

      <div className={styles.info}>
        <div className={styles.name}>
          {user.firstName} {user.lastName}
        </div>
        {user.nickname && <div className={styles.nickname}>@{user.nickname}</div>}
      </div>

      <div
        className={styles.statusDot}
        title={user.online ? "Online" : "Offline"}
      ></div>
    </div>
  );
};

export default ChatCard;
