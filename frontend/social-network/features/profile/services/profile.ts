import apiClient from '../../../libs/apiClient';
import { ProfileData } from '../types';

export default async function getProfileData(userId: string): Promise<ProfileData> {
    return apiClient.get(`/api/v1/users/${userId}/profile`);
}