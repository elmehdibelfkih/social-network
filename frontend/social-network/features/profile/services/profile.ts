import apiClient from '@/libs/apiClient';
import { ProfileData, FollowResponse } from '../types';

export default async function getProfileData(userId: string): Promise<ProfileData> {
    return apiClient.get(`/api/v1/users/${userId}/profile`);
}

export async function followPerson(userId: string): Promise<FollowResponse> {
    return apiClient.post(`/api/v1/users/${userId}/follow`)
}

export async function unfollowPerson(userId: string): Promise<FollowResponse> {
    return apiClient.post(`/api/v1/users/${userId}/unfollow`)
}
