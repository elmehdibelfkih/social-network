import { FooterServer } from '@/features/footer';
import { Profile } from '@/features/profile';
import getProfileData from '@/features/profile/profileSrevice';
import ProfileFeed from '@/features/profile_feed/profile_feed.server';

interface PageProps {
  params: Promise<{ user_id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { user_id } = await params;
  const { tab } = await searchParams;

  const profile = await getProfileData(user_id)

  return (
    <>
      <Profile profile={profile} />
      <ProfileFeed profile={profile} tab={tab || 'about'} />
    </>
  );
}