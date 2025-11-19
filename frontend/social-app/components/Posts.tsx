import React from "react";
import styles from "../styles/components/posts.module.css";

export default function Post() {
    return (
        <div className={styles.postCard}>
            <div className={styles.postUserSection}>
                <div className={styles.postUserAvatar}>
                    <img src="/images/user.jpg" alt="User Avatar" />
                </div>
                <div className={styles.postUserInfo}>
                    <h4>Sarah Johnson</h4>
                    <span>4h ago · Public</span>
                </div>
            </div>

            <div className={styles.postCaption}>
                <p>Lunch with the team today! Great food and even better company.</p>
            </div>

            <div className={styles.postImg}>
                <img src="/Screenshot From 2025-11-17 16-07-43.png" alt="Post" />
            </div>

            <div className={styles.postInteraction}>
                <div className={styles.interactionItem}>
                    <img src="/icons/like.svg" alt="like icon" />
                    <span>65 likes</span>
                </div>

                <div className={styles.interactionItem}>
                    <img src="/icons/comment.svg" alt="comment icon" />
                    <span>0 comments</span>
                </div>

                <div className={styles.interactionItem}>
                    <img src="/icons/share.svg" alt="share icon" />
                    <span>Share</span>
                </div>
            </div>
        </div>
    );
}
