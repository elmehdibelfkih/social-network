import { getUserId } from '@/libs/helpers';

export default async function SearchPage({ children }: { children: React.ReactNode }) {
  const userId = await getUserId()

  return (
    <>
      <h1 />
      {children}
    </>
  );
}