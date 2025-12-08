import { Search } from '@/features/search/search.client';

export default async function SearchPage({ children }: { children: React.ReactNode }) {

  return (
    <>
      <Search/>
      {children}
    </>
  );
}