import { http } from '../../../libs/apiClient';
import { MediaResponse } from '../../../libs/globalTypes';
import { ProfileData, FollowResponse, PrivacyToggleResponse } from '../types';

export default async function getProfileData(userId: string): Promise<ProfileData> {
    return http.get(`/api/v1/users/${userId}/profile`);
}

export async function followPerson(userId: string): Promise<FollowResponse> {
    return http.post(`/api/v1/users/${userId}/follow`)
}

export async function unfollowPerson(userId: string): Promise<FollowResponse> {
    return http.post(`/api/v1/users/${userId}/unfollow`)
}

export async function togglePrivacy({ userId, body }: { userId: string, body: {} }): Promise<PrivacyToggleResponse> {
    return http.patch(`/api/v1/users/${userId}/privacy`, body)
}

export async function getMedia(mediaId: string): Promise<MediaResponse> {
    return http.get(`/api/v1/media/${mediaId}`)
}