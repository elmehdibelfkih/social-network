import MiniProfile from "@/features/mini_profile";
import { ProfileSummaryServer } from "@/features/profile_summary";
import { Posts, Post as PostView } from "@/features/posts";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";
import NewPostServer from "@/features/newPost/newPostWrapper.client";

export default async function HomePage(): Promise<JSX.Element> {
  const userId = await getUserId();
  const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);
  
  return (
    <div className="homepage-layout">
      <aside className="sidebar-left">
        <ProfileSummaryServer userId={userId} />
      </aside>
      
      <main className="main-feed">


      <div>
        <NewPostServer avatarId={res2?.avatarId ?? null} />
      </div>
        {
          (() => {
            // Inject a sample post for testing directly into Posts
            const samplePost = {
              postId: 704940775444480,
              authorId: 682803066966016,
              authorNickname: 'Amy Alford',
              authorFirstName: 'Sophia',
              authorLastName: 'Carver',
              authorAvatarId: 321855378558976,
              content: 'rflkjflkgjlkfgjlkfdjg',
              mediaIds: [704940754472960],
              privacy: 'public',
              isLikedByUser: false,
              stats: { reactionCount: 0, commentCount: 0 },
              createdAt: '2025-12-01T13:36:20+01:00',
              updatedAt: '2025-12-01T13:36:20+01:00'
            } as any;

              return <div><PostView post={samplePost} /></div>;
          })()
        }
      </main>
      
      <aside className="sidebar-right">
        <MiniProfile data={res2} />
      </aside>
    </div>
  );
}