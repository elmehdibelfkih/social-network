
import { ProfileSummary } from "@/features/profile_summary";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { NewPost } from "@/features/newPost";
import { postsService } from "@/features/posts";
import PostServer from "@/features/posts/posts.server";
import { useUserStats } from "@/providers/userStatsContext";
import { ChatSection } from "@/features/chat";
import styles from "@/styles/app.module.css"

export default async function HomePage(): Promise<JSX.Element> {
  const userId = await getUserId();
  const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);

  const posts = await postsService.getFeed({ page: 1, limit: 20 })

  return (
    <>
      <ProfileSummary/>
      <div>
        <NewPost data={res2} isMyprofile={false} />
      </div>
      <div>
        {posts.length === 0 ? (
          <p>
            No posts yet. Be the first to create one!
          </p>
        ) : (
          posts.map((post) => (
            <PostServer key={post.postId} post={post} />
          ))
        )}
      </div>
      <main className={styles.main}>
        <div className={styles.firstSection}>
          <ProfileSummary userId={userId} />
        </div>
        <div className={styles.secondSection}>
          <NewPost data={res2} isMyprofile={false} />
          {posts.length === 0 ? (
            <p>
              No posts yet. Be the first to create one!
            </p>
          ) : (
            posts.map((post) => (
              <PostServer key={post.postId} post={post} />
            ))
          )}
        </div>
        <div className={styles.thirdSection}>
          <ChatSection></ChatSection>
        </div>
        {/* <MiniProfile data={res2} isMyprofile={false} /> */}
      </main>
    </>
  );
}


