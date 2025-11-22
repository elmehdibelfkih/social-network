import { serverHttp } from '../../../libs/apiClient.server'
import { ProfileData } from '../types'

export async function getProfileData(userId: string): Promise<ProfileData> {
    return serverHttp.get<ProfileData>(`/api/v1/users/${userId}/profile`)
}