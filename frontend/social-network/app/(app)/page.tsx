
import { ProfileSummary } from "@/features/profile_summary";
import { JSX } from "react";
import { NewPost } from "@/features/newPost";
import { postsService } from "@/features/posts";
import { Feed } from "@/features/posts/Feed";
import { ChatSection } from "@/features/chat";
import styles from "@/styles/app.module.css"

export default async function HomePage(): Promise<JSX.Element> {
  const posts = await postsService.getFeed({ page: 1, limit: 20 })

  return (
    <>
      <main className={styles.main}>
        <div className={styles.firstSection}>
          <ProfileSummary />
        </div>
        <div className={styles.secondSection}>
          <NewPost />
          <Feed initialPosts={posts} />
        </div>
        <div className={styles.thirdSection}>
          <ChatSection></ChatSection>
        </div>
      </main>
    </>
  );
}


