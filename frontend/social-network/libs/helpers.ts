import { http } from "./apiFetch";
import type {
    MediaResponse,
    UserId
} from '@/libs/globalTypes'


export async function getUserId() {
    const res = await http.get<UserId>('/api/v1/users/id');
    return res.Id
}

export async function fetchMediaClient(mediaId: string): Promise<MediaResponse> {
    const res = await http.get(`/api/v1/media/${encodeURIComponent(mediaId)}`)
    const payload = res
    return payload as MediaResponse
}
