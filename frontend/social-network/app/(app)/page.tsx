
import { ProfileSummary } from "@/features/profile_summary";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { NewPost } from "@/features/newPost";
import { postsService } from "@/features/posts";
import { Feed } from "@/features/posts/Feed";

export default async function HomePage(): Promise<JSX.Element> {


  const userId = await getUserId();
  const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);

  const posts = await postsService.getFeed({ page: 1, limit: 20 })

  return (
    <>
      <ProfileSummary/>
      <div>
        <NewPost  isMyprofile={false} />
      </div>
      <Feed initialPosts={posts} />
    </>
  );
}


