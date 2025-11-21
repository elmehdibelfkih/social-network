import { http } from '../../../libs/apiClient';
import { ProfileData, FollowResponse } from '../types';

export default async function getProfileData(userId: number): Promise<ProfileData> {
    return http.get(`/api/v1/users/${userId}/profile`);
}

export async function followPerson(userId: number): Promise<FollowResponse> {
    return http.post(`/api/v1/users/${userId}/follow`)
}

export async function unfollowPerson(userId: number): Promise<FollowResponse> {
    return http.post(`/api/v1/users/${userId}/unfollow`)
}
