import { Profile } from "@/features/profile/profile.server";

interface PageProps {
  params: Promise<{ user_id: string }>;
}

export default async function ProfileLayout(
  { children, params }: { children: React.ReactNode; params: PageProps }
) {
  const { user_id } = await params;
  console.log("server params:>",user_id, "<"); // logs to Node/terminal
  return (
    <>
      <Profile user_id={user_id} />
      {children}
    </>
  );
}
