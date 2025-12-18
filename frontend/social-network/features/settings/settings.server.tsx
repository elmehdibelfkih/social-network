import { SettingsClient } from './settings.client';
import { getUserId } from '@/libs/helpers';
import { http } from '@/libs/apiFetch';
import { ProfileAPIResponse } from '@/libs/globalTypes';

export default async function Settings() {
  const userId = await getUserId();
  const profile = await http.get<ProfileAPIResponse>(`/api/v1/users/${userId}/profile`);

  return <SettingsClient profile={profile} />;
}