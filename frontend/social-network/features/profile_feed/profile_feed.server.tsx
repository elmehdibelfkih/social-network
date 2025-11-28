import { PostsSection } from "./posts_section.client";

// type Props = {
//   params: { userId: string }
// }

export default async function ProfileFeed({ userId }: { userId: string }) {
  // const userId = userID

  return (
    <div>
      <PostsSection userId={userId} />
      </>
    </div>
  )
}