
import MiniProfile from "@/features/mini_profile";
import { ProfileSummaryServer } from "@/features/profile_summary";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { NewPost } from "@/features/newPost";
import { postsService } from "@/features/posts";
import PostServer from "@/features/posts/posts.server";
import { useUserStats } from "@/providers/userStatsContext";

export default async function HomePage(): Promise<JSX.Element> {
  const userId = await getUserId();
  const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);

  const posts = await postsService.getFeed({ page: 1, limit: 20 })

  return (
    <>
      <ProfileSummaryServer userId={userId} />
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
      <MiniProfile data={res2} isMyprofile={false} />
    </>
  );
}


