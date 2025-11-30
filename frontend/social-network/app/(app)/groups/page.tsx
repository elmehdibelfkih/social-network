import { getUserId } from '@/libs/helpers';

export default async function GroupePage({ children }: { children: React.ReactNode }) {
  const userId = await getUserId()

  return (
    <>
      <h1 />
      {children}
    </>
  );
}