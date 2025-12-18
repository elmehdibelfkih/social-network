import { Settings } from '@/components/ui/settings/settingsPage';
import { getUserId } from '@/libs/helpers';

export default async function SettingsPage({ children }: { children: React.ReactNode }) {
  const userId = await getUserId()

  return (
    <>
      <h1 />
      <Settings userId={userId} />
      {children}
    </>
  );
}