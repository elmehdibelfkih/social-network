// @ts-ignore
import { apiClient } from '@/libs/apiClient';
// @ts-ignore
import { ProfileData } from '../types.ts';

export async function getProfileData(userId: string): Promise<ProfileData> {
    return apiClient.get(`/api/v1/users/${userId}/profile`);
}