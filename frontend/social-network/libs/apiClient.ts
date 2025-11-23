const BASE_URL = process.env.NEXT_PUBLIC_GO_API_URL

const isServer = typeof window === 'undefined'

export const http = {
    get: <T>(url: string) => apiClient<T>(url, "GET", undefined),
    post: <T>(url: string, payload?: any) => apiClient<T>(url, "POST", payload),
    put: <T>(url: string, payload?: any) => apiClient<T>(url, "PUT", payload),
    patch: <T>(url: string, payload?: any) => apiClient<T>(url, "PATCH", payload),
    delete: <T>(url: string) => apiClient<T>(url, "DELETE", undefined),
};

async function apiClient<T>(endpoint: string, method: string, payload?: any): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (isServer) {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }
    }

    try {
        const response = await fetch(url, {
            method,
            credentials: isServer ? undefined : 'include',
            headers,
            body: payload ? JSON.stringify(payload) : undefined,
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
            if (response.status === 401) {
                console.log(body) ////////////////////////
                return undefined as T;
            }

            const errorMessage = body?.error?.errorMessage || "Something went wrong";

            if (!isServer) {
                const { ShowSnackbar } = await import("../components/ui/snackbar");
                ShowSnackbar({ status: false, message: errorMessage });
            }

            return Promise.reject(new Error(errorMessage));
        }

        if (!isServer && method !== 'GET') {
            const { ShowSnackbar } = await import("../components/ui/snackbar");
            ShowSnackbar({ status: true, message: "Operation successful" });
        }

        return body;

    } catch (error) {
        if (!isServer) {
            const { ShowSnackbar } = await import("../components/ui/snackbar");
            ShowSnackbar({ status: false, message: "Network Error" });
        }
        return Promise.reject(error instanceof Error ? error : new Error("Unknown Error"));
    }
}
