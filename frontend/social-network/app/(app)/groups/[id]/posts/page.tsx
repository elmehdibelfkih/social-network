import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { NewPost } from "@/features/newPost";
import { postsService } from "@/features/posts";
import { Feed } from "@/features/posts/Feed";


export default async function PostPage({ params }): Promise<JSX.Element> {
  const { id } = await params;
  const groupId = Number(id)

  // const userId = await getUserId();
  // const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);

  const posts = await postsService.getGroupFeed(groupId, { page: 1, limit: 20 })
  // const groupPost = await 

  return (
    <>
      <div>
        <NewPost groupId={groupId} isMyprofile={false} />
      </div>
      <div>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#707070ff', background: '#ffffffff', borderRadius: '10px', border: '5px Dotted #d1d5db'}}> No posts yet. Be the first to create one! </p>
        ) : (
          <Feed initialPosts={posts} />
        )}
      </div>
    </>
  );
}

