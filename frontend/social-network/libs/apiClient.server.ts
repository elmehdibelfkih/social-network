import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_GO_API_URL

export const serverHttp = {
    get: <T>(url: string) => serverApiClient<T>(url, "GET"),
    post: <T>(url: string, payload?: any) => serverApiClient<T>(url, "POST", payload),
    put: <T>(url: string, payload?: any) => serverApiClient<T>(url, "PUT", payload),
    patch: <T>(url: string, payload?: any) => serverApiClient<T>(url, "PATCH", payload),
    delete: <T>(url: string) => serverApiClient<T>(url, "DELETE"),
};

async function serverApiClient<T>(endpoint: string, method: string, payload?: any): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();


    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(cookieHeader && { Cookie: cookieHeader }),
        },
        body: payload ? JSON.stringify(payload) : undefined,
        cache: 'no-store',
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMessage = body?.error?.ErrorMessage || "Something went wrong";
        throw new Error(errorMessage);
    }
    console.log(body);

    return body;
}
