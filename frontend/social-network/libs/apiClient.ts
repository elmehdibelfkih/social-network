import { ShowSnackbar } from "../components/ui/snackbar"
import { ApiErrorResponse } from "../features/auth/types";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
const BASE_URL = process.env.NEXT_PUBLIC_GO_API_URL

export const http = {
    get: <T>(url: string) => apiClient<T>(url, "GET", undefined),
    post: <T>(url: string, payload?: any) => apiClient<T>(url, "POST", payload),
    put: <T>(url: string, payload?: any) => apiClient<T>(url, "PUT", payload),
    patch: <T>(url: string, payload?: any) => apiClient<T>(url, "PATCH", payload),
    delete: <T>(url: string) => apiClient<T>(url, "DELETE", undefined),
    get: <T>(url: string) => apiClient<T>(url, "GET", undefined),
    post: <T>(url: string, payload?: any) => apiClient<T>(url, "POST", payload),
    put: <T>(url: string, payload?: any) => apiClient<T>(url, "PUT", payload),
    patch: <T>(url: string, payload?: any) => apiClient<T>(url, "PATCH", payload),
    delete: <T>(url: string) => apiClient<T>(url, "DELETE", undefined),
};

async function apiClient<T>(
    url: string,
    method: HttpMethod,
    payload?: any
): Promise<T> {
    url = `${BASE_URL}${url}`

    const config: RequestInit = {
        method,
        credentials: 'include',
        headers: {
            "content-type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined
    };

    let body

    try {
        const response = await fetch(url, config)
        try {
            body = await response.json()
        } catch (error) {
            body = null
        }
        if (!response.ok) {
            if (body.error.type == 'redirect') {
            }
            ShowSnackbar(body)
            return Promise.reject()
        }
    } catch (error) {
        console.error(error)
    }
    return body
}
