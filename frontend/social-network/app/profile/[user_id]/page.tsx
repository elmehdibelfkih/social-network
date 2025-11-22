import { Profile } from '../../../features/profile';
import { AuthProvider } from '../../../providers/authProvider';

interface PageProps {
  params: Promise<{ user_id: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { user_id } = await params;

  return (
    <AuthProvider>
      <Profile user_id={user_id} />
    </AuthProvider>
  );
}