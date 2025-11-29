import { Profile } from '@/features/profile';
import ProfileFeed from '@/features/profile_feed/profile_feed.server';
import { getUserId } from '@/libs/helpers';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const userId = await getUserId();
  const { tab } = await searchParams;

  return (
    <>
      <Profile user_id={String(userId)} />
      <ProfileFeed userId={String(userId)} tab={tab || 'posts'} />
    </>
  );
}