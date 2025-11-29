import { Profile } from '@/features/profile';
import ProfileFeed from '@/features/profile_feed/profile_feed.server';

interface PageProps {
  params: Promise<{ user_id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { user_id } = await params;
  const { tab } = await searchParams;

  return (
    <>
      <Profile user_id={user_id} />
      <ProfileFeed userId={user_id.toString()} tab={tab || 'posts'} />
    </>
  );
}