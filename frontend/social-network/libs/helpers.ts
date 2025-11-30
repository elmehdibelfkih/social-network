import { http } from "./apiFetch";
import type {
    MediaResponse,
    UserId
} from '@/libs/globalTypes'


export async function getUserId() {
    const res = await http.get<UserId>('/api/v1/users/id');
    return res.Id
}
