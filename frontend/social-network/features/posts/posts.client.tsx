'use client';

import styles from './styles.module.css';

export function PostsClient() {
  // PURE FRONTEND UI — no hooks, no arguments, no logic

  return (
    <div className={styles.postsContainer}>
      
      {/* Example static post */}
      <div className={styles.postCard}>
        
        <div className={styles.postUserSection}>
          <div className={styles.postUserAvatar}>
            <img src="/svg/users.svg" alt="User Avatar" />
          </div>

          <div className={styles.postUserInfo}>
            <h4>John Doe</h4>
            <span>2 hours ago · Public</span>
          </div>
        </div>

        <div className={styles.postCaption}>
          <p>This is an example post content for UI only.</p>
        </div>

        <div className={styles.postImg}>
          <img src="/svg/pic.png" alt="Post media" />
        </div>

        <div className={styles.postInteraction}>
          <button className={styles.interactionItem}>
            <img src="/icons/like.svg" alt="like icon" />
            <span>12 likes</span>
          </button>

          <button className={styles.interactionItem}>
            <img src="/icons/comment.svg" alt="comment icon" />
            <span>4 comments</span>
          </button>

          <button className={styles.interactionItem}>
            <img src="/icons/share.svg" alt="share icon" />
            <span>Share</span>
          </button>
        </div>

      </div>

    </div>
  );
}
