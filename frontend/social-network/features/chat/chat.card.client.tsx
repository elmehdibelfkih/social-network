'use client'
import React from "react";
import styles from "./styles/chatcard.module.css";

export interface ChatContactProps {
  chatId: number;
  unreadCount: number;
  profileImage: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  isOnline: boolean;
  onClick?: (chatId: number) => void;
}

export const ChatCard: React.FC<ChatContactProps> = ({
  chatId,
  unreadCount,
  profileImage,
  firstName,
  lastName,
  nickname,
  isOnline,
  onClick,
}) => {
  return (
    <div
      className={`${styles.contactItem} ${isOnline ? styles.online : styles.offline}`} onClick={() => onClick?.(chatId)} >
      <img
        src={profileImage}
        alt={`${firstName} ${lastName}`}
        className={styles.avatar}
      />

      <div className={styles.info}>
        <div className={styles.name}>
          {firstName} {lastName}
        </div>
        {nickname && <div className={styles.nickname}>@{nickname}</div>}
      </div>

      <div
        className={styles.statusDot}
        title={isOnline ? "Online" : "Offline"}
      ></div>
    </div>
  );
};

export default ChatCard;
