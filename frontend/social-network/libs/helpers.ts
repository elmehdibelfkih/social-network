import { http } from "./apiFetch";

export interface UserId {
    Id: number;
}

export async function getUserId() {
    const res = await http.get<UserId>('/api/v1/users/id');
    return res.Id
}