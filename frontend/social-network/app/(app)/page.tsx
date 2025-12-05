
import MiniProfile from "@/features/mini_profile";
import { ProfileSummaryServer } from "@/features/profile_summary";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import { NewPost } from "@/features/newPost";
import { postsService } from "@/features/posts";
import PostServer from "@/features/posts/posts.server";

export default async function HomePage(): Promise<JSX.Element> {
  const userId = await getUserId();
  const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);
  
  // Mock post data for testing
  const mockPosts = [
    {
      postId: 2222451312431104,
      authorId: 2217444638855168,
      authorNickname: "Camille Weeks",
      authorLastName: "Frost",
      authorFirstName: "Bryar",
      content: "hi this is a test.",
      mediaIds: [2222451232739328],
      privacy: "public" as const,
      groupId: null,
      allowedList: null,
      isLikedByUser: false,
      stats: {
        reactionCount: 0,
        commentCount: 0,
      },
      createdAt: "2024-01-15T14:30:00Z",
      updatedAt: "2024-01-15T14:30:00Z"
    },
    {
      postId: 128984387246926,
      authorId: 128984387246930,
      authorNickname: "devops_mehdi",
      authorLastName: "Khalifa",
      authorFirstName: "Mehdi",
      content: "Hello world — launching my new service today! 🚀 Excited to share this journey with everyone.",
      mediaIds: null,
      privacy: "public" as const,
      groupId: null,
      allowedList: null,
      isLikedByUser: true,
      stats: {
        reactionCount: 15,
        commentCount: 3,
      },
      createdAt: "2024-01-15T12:00:00Z",
      updatedAt: "2024-01-15T12:00:00Z"
    }
  ];

  return (
    <>
      <ProfileSummaryServer userId={userId} />
      <div>
          <NewPost  data={res2} isMyprofile={false}  />
      </div>
      <div>
        {mockPosts.map((post) => (
          <PostServer key={post.postId} post={post} />
        ))}
      </div>
      <MiniProfile data={res2} isMyprofile={false} />
    </>
  );
}
