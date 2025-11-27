
import { ProfileSummaryServer } from "@/features/profile_summary";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";

export default async function HomePage(): Promise<JSX.Element> {
  const res = await http.get('/api/v1/users/id');
  return (
    <>
      {/* <ProfileSummaryServer/> */}
       <ProfileSummaryServer userId={res.Id} />;

    </>
  );
}
