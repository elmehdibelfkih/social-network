import { Profile } from '@/features/profile';

interface PageProps {
  user_id: string;
}

export default async function ProfilePage(  { children, params }: { children: React.ReactNode; params: PageProps }
) {
  const { user_id } = await params;
  return (
    <>
      <Profile user_id={user_id} />
      {children}
    </>
  );
}