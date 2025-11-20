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

async function apiClient<T>(
    url: string,
    method: HttpMethod,
    payload?: any
): Promise<T> {
    const response = await fetch(url, {
        method: method,
        headers: {
            "content-type": "application/json"
        },
        body: payload ? JSON.stringify(payload) : undefined
    })
    const body = await response.json()
    if (!response.ok) {
        const errorToast = {
            payload: {
                success: false,
                message: body.error.ErrorMessage
            }
        }
        showSnackbar(errorToast)
        return Promise.reject()
    }
    return body
}

function showSnackbar({ payload }: { payload: SnackbarPayload }) {
    ShowSnackbar({ status: payload.success, message: payload.message })
}

type SnackbarPayload = {
    success: boolean
    message: string
}