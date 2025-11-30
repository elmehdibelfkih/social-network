
import MiniProfile from "@/features/mini_profile";
import { ProfileSummaryServer } from "@/features/profile_summary";
import { http } from "@/libs/apiFetch";
import { JSX } from "react";
import { getUserId } from "@/libs/helpers";
import { ProfileAPIResponse } from "@/libs/globalTypes";

export default async function HomePage(): Promise<JSX.Element> {
  const userId = await getUserId();
  const res2 = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);

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
