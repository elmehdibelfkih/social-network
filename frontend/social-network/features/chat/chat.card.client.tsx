'use client'
import React from "react";
import styles from "./chatcard.module.css";

export interface ChatContactProps {
  profileImage: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  isOnline: boolean;
}

export const ChatCard: React.FC<ChatContactProps> = ({
  profileImage,
  firstName,
  lastName,
  nickname,
  isOnline,
}) => {
  return (
    <div
      className={`${styles.contactItem} ${
        isOnline ? styles.online : styles.offline
      }`}
    >
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
