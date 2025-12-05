import { Profile } from '@/features/profile';
import getProfileData from '@/features/profile/profileSrevice';
import ProfileFeed from '@/features/profile_feed/profile_feed.server';
import { getUserId } from '@/libs/helpers';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const userId = await getUserId();
  const { tab } = await searchParams;

  const profile = await getProfileData(String(userId))
  
  return (
    <>
      <Profile profile={profile} />
      <ProfileFeed profile={profile} tab={tab || 'about'} />
    </>
  );
}