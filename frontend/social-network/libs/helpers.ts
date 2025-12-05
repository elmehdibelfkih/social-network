import { http } from "./apiFetch";
import type {
    MediaResponse,
    UserId
} from '@/libs/globalTypes'


export async function getUserId() {
    const res = await http.get<UserId>('/api/v1/users/id');
    return res.Id
}

export function formatMessageDate(dateStr: string): string {
    const d = new Date(dateStr.replace(" ", "T") + "Z");

    if (isNaN(d.getTime())) {
        console.warn("Invalid date:", dateStr);
        return "";
    }

    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffMs = today.getTime() - msgDay.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const time = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    if (diffDays === 0) return time;
    if (diffDays === 1) return `Yesterday ${time}`;

    return d.toLocaleDateString("en-GB");
}

