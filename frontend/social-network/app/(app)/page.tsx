
import MiniProfile from "@/features/mini_profile";
import { ProfileAPIResponse as ProfileSummaryAPIResponse, ProfileSummaryServer } from "@/features/profile_summary";
import { ProfileAPIResponse as MiniProfileAPIResponse } from "@/features/mini_profile/types";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";

export default async function HomePage(): Promise<JSX.Element> {
  const userId = await getUserId();  
  const res2 =  await http.get<MiniProfileAPIResponse>(`/api/v1/users/${userId}/profile`);
  return (
    <>
       <ProfileSummaryServer userId={userId} />
       <div>
        <p>
        </p>
       </div>
       <MiniProfile data={res2} />
    </>
  );
}
