import { Profile } from '@/features/profile';

interface PageProps {
  params: Promise<{ user_id: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { user_id } = await params;
  return (
    <div>
      
    </div>
  );
}