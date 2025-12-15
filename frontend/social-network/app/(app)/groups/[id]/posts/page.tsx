import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { NewPost } from "@/features/newPost";
import { postsService } from "@/features/posts";
import PostServer from "@/features/posts/posts.server";


export default async function PostPage({ params }): Promise<JSX.Element> {
 const { id } = await params;
    const groupId = Number(id)

  // const userId = await getUserId();
  // const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);

  const posts = await postsService.getGroupFeed(groupId ,{ page: 1, limit: 20 })
 // const groupPost = await 

  return (
    <>
      <div>
        {/* <NewPost data={res2} isMyprofile={false} /> */}
      </div>
      <div>
        {posts.length === 0 ? (
          <p>
            No posts yet. Be the first to create one! 456123
          </p>
        ) : (
          posts.map((post) => (
            <PostServer key={post.postId} post={post} />
          ))
        )}
      </div>
    </>
  );
}

