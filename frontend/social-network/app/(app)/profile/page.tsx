import { Profile } from '@/features/profile';
import { getUserId } from '@/libs/helpers';

export default async function ProfilePage(  { children }: { children: React.ReactNode }
) {
  const userId  = await getUserId()
  
  return (
    <>
      <Profile user_id={String(userId)} />
      {children}
    </>
  );
}