'use client'

import { ShowSnackbar } from "../components/ui/snackbar"

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export const http = {
    get: <T>(url: string) =>
        apiClient<T>(url, "GET", undefined),

    post: <T>(url: string, payload?: any) =>
        apiClient<T>(url, "POST", payload),

    put: <T>(url: string, payload?: any) =>
        apiClient<T>(url, "PUT", payload),

    patch: <T>(url: string, payload?: any) =>
        apiClient<T>(url, "PATCH", payload),

    delete: <T>(url: string) =>
        apiClient<T>(url, "DELETE", undefined),
};

const BASE_URL = process.env.NEXT_PUBLIC_GO_API_URL

// async function apiClient<T>(
//     url: string,
//     method: HttpMethod,
//     payload?: any
// ) {
//     const resp = await fetch(`http://localhost:8080${url}`, {
//         method: method,
//         credentials: 'include',
//         headers: {
//             "content-type": "application/json"
//         },
//         body: payload ? JSON.stringify(payload) : undefined
//     })
//     const v = await resp.json()
//     console.log(v)
// }

async function apiClient<T>(endpoint: string, method: string, payload?: any): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: method,
            credentials: 'include', // ✅ Safe to use in Client Components
            headers: {
                "Content-Type": "application/json"
            },
            body: payload ? JSON.stringify(payload) : undefined
        });

        // Safe parsing (prevents crash if body is empty)
        const body = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMessage = body?.error?.ErrorMessage || "Something went wrong";

            // ✅ 1. Show the Snackbar
            ShowSnackbar({
                status: false,
                message: errorMessage
            });

            // ✅ 2. FIX THE "DIGEST" ERROR
            // You MUST pass an Error object to reject, not empty/undefined
            return Promise.reject(new Error(errorMessage));
        }

        // Show success snackbar for non-GET requests
        if (method !== 'GET') {
            ShowSnackbar({ status: true, message: "Operation successful" });
        }

        return body;

    } catch (error) {
        // Handle network errors (offline, etc)
        ShowSnackbar({ status: false, message: "Network Error" });
        // Fix digest error here too
        return Promise.reject(error instanceof Error ? error : new Error("Unknown Error"));
    }
}

function showSnackbar({ payload }: { payload: SnackbarPayload }) {
    ShowSnackbar({ status: payload.success, message: payload.message })
}

type SnackbarPayload = {
    success: boolean
    message: string
}