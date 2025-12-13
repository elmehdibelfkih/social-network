import { Suspense } from 'react';
import { TopPart } from "./newPost.client";


import styles from "./styles.module.css";
import { NewPostClient } from "./newPost.client";


export function NewPost() {
  //todo: const name = displayName(state)
  const name = "test"
  return (
    <div className={styles.wrapper}>
      <noscript>
        <form method="POST" action="/api/v1/posts" className={styles.form}>
          <TopPart />
          <div className={styles.rightPart}>
            <div className={styles.bottomPart}>
              <label className={styles.uploadImageButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                Photo
                <input
                  type="file"
                  name="media"
                  accept="image/*"
                  multiple
                  hidden
                />
              </label>

              <div className={styles.privacyButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <select name="privacy" className={styles.noJsPrivacySelect}>
                  <option value="public">Public</option>
                  <option value="followers">Followers</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <button className={styles.actionButton} type="submit">
                Post
              </button>
            </div>
          </div>
        </form>
      </noscript>

      <Suspense fallback={
        <div ></div>
      }>
        <NewPostClient />
      </Suspense>
    </div>
  );
}