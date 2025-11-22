'use client'

import { ShowSnackbar } from "../components/ui/snackbar"

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

async function apiClient<T>(endpoint: string, method: string, payload?: any): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            },
            body: payload ? JSON.stringify(payload) : undefined
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMessage = body?.error?.ErrorMessage || "Something went wrong";

            ShowSnackbar({
                status: false,
                message: errorMessage
            });

            return Promise.reject(new Error(errorMessage));
        }

        if (method !== 'GET') {
            ShowSnackbar({ status: true, message: "Operation successful" });
        }

        return body;

    } catch (error) {
        ShowSnackbar({ status: false, message: "Network Error" });
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