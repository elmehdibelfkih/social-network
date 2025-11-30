import MiniProfile from "@/features/mini_profile";
import { ProfileSummaryServer } from "@/features/profile_summary";
import { Posts, Post as PostView } from "@/features/posts";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";

export default async function HomePage(): Promise<JSX.Element> {
  const userId = await getUserId();
  const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);
  
  return (
    <div className="homepage-layout">
      <aside className="sidebar-left">
        <ProfileSummaryServer userId={userId} />
      </aside>
      
      <main className="main-feed">
        {/* Main feed showing posts from followed users */}
        {
          (() => {
            // Inject a sample post for testing directly into Posts
            const samplePost = {
              postId: 324772177252352,
              authorId: 321875913871360,
              authorNickname: 'Rosalyn Stone',
              authorFirstName: 'Franks',
              authorLastName: 'Ahmed',
              authorAvatarId: 321855378558976,
              content: 'vjksndkvnksdsfb',
              mediaIds: [324772139503616],
              privacy: 'public',
              isLikedByUser: true,
              stats: { reactionCount: 1, commentCount: 0 },
              createdAt: '2025-11-30T12:25:41+01:00',
              updatedAt: '321875913871360'
            } as any;

              return <PostView post={samplePost} />;
          })()
        }
      </main>
      
      <aside className="sidebar-right">
        <MiniProfile data={res2} />
      </aside>
    </div>
  );
}