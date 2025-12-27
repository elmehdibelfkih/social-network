import { redirect as nextRedirect } from 'next/navigation';

import { ShowSnackbar } from '@/components/ui/snackbar/snackbar';
import { MediaResponse } from './globalTypes';

const BASE_URL = process.env.NEXT_PUBLIC_GO_API_URL ?? '';
const isServer = typeof window === 'undefined';

export class HTTPError extends Error {
  status: number;
  body: any;
  constructor(status: number, message: string, body?: any) {
    super(message);
    this.name = 'HTTPError';
    this.status = status;
    this.body = body;
  }
}

export type ApiError = {
  statusCode?: number;
  statusText?: string;
  errorMessage?: string;
  errorTitle?: string;
  errorDescription?: string;
  errorType?: 'redirect' | 'alert' | string;
};

type RawApiResponse<T> =
  | { success: true; payload: T }
  | { success: false; error: ApiError };

export type ApiFetchOpts = {
  redirectOnError?: boolean;
  errorRoute?: string;
  throwOnError?: boolean;
  clientNavigate?: (path: string) => void;
  nextRevalidate?: number;
  cache?: RequestCache;
  redirectTitle?: string;
  errorMessage?: string;
};

function buildErrorTarget(
  errorRoute: string,
  apiError: ApiError,
  status: number,
  custom?: { title?: string; message?: string }
): string {
  const params = new URLSearchParams();

  if (status) params.set('status', String(status));

  if (apiError.statusCode) params.set('code', String(apiError.statusCode));
  if (apiError.statusText) params.set('statusText', apiError.statusText);

  const finalTitle = apiError.errorTitle ?? custom?.title ?? 'Error';
  params.set('title', finalTitle);

  const finalMessage = apiError.errorMessage ?? custom?.message ?? 'An unexpected error occurred';
  params.set('msg', finalMessage);

  if (apiError.errorDescription) params.set('desc', apiError.errorDescription);

  return `${errorRoute}?${params.toString()}`;
}

function performRedirect(target: string, clientNavigate?: (path: string) => void): never {
  if (isServer) {
    console.log(target)
    nextRedirect(target);
  } else {
    if (typeof clientNavigate === 'function') {
      clientNavigate(target);
    } else {
      window.location.replace(target);
    }
    throw new Error('Redirecting...');
  }
}

export async function apiFetch<T>(
  endpoint: string,
  method: string,
  payload?: any,
  opts: ApiFetchOpts = {}
): Promise<T | null> {
  const {
    redirectOnError = true,
    errorRoute = '/error',
    throwOnError = false,
    clientNavigate,
    nextRevalidate,
    cache,
    redirectTitle,
    errorMessage
  } = opts;

  const url = `${BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (isServer) {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();
      if (cookieHeader) headers['Cookie'] = cookieHeader;
    } catch (e) {
    }
  }

  let response: Response;
  let rawBody: RawApiResponse<T> | null = null;
  let status = 0;

  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: isServer ? undefined : 'include',
      body: payload ? JSON.stringify(payload) : undefined,
      cache,
      next: nextRevalidate !== undefined ? { revalidate: nextRevalidate } : undefined,
    } as RequestInit);

    if (!response) {
      throw new Error('No response received from server');
    }

    status = response.status;
    rawBody = await response.json().catch(() => null);

  } catch (err: any) {
    if (isServer && err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    if (isServer && err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    const networkMsg = err instanceof Error ? err.message : 'Network failure';
    if (throwOnError) {
      throw new HTTPError(0, networkMsg);
    }
    return null;
  }

  if (response.ok && rawBody !== null && typeof rawBody === 'object' && rawBody.success === true) {
    return rawBody.payload ?? null;
  }

  let apiError: ApiError = {
    statusCode: status,
    statusText: response.statusText,
    errorMessage: 'Unknown API Error',
    errorType: 'unknown'
  };

  if (!response.ok && rawBody !== null && typeof rawBody === 'object' && rawBody.success === false) {
    const apiErrorData = rawBody.error ?? {};

    apiError = {
      statusCode: apiErrorData.statusCode ?? status,
      statusText: apiErrorData.statusText ?? response.statusText ?? 'Unknown Error',
      errorMessage: apiErrorData.errorMessage ?? 'Request failed',
      errorTitle: apiErrorData.errorTitle,
      errorDescription: apiErrorData.errorDescription,
      errorType: apiErrorData.errorType ?? 'unknown'
    };
  }

  if (apiError.statusCode === 401) {
    performRedirect('/auth', clientNavigate);
  }

  const message = apiError.errorMessage ?? 'Request failed';

  if (redirectOnError && apiError.errorType === 'redirect') {
    const target = buildErrorTarget(errorRoute ?? '/error', apiError, status, {
      title: redirectTitle,
      message: errorMessage
    });
    performRedirect(target, clientNavigate);
  }

  if (apiError.errorType === 'alert') {
    if (!isServer) {
      ShowSnackbar({ status: false, message });
      if (throwOnError) {
        throw new HTTPError(status, message, rawBody);
      }
      return null;
    } else {
      const target = buildErrorTarget(errorRoute ?? '/error', apiError, status, {
        title: redirectTitle,
        message: errorMessage
      });
      performRedirect(target, clientNavigate);
    }
  }

  if (throwOnError) {
    throw new HTTPError(status, message, rawBody);
  }

  return null;
}

export const http = {
  get: <T>(url: string, opts?: ApiFetchOpts) => apiFetch<T>(url, 'GET', undefined, opts),
  post: <T>(url: string, payload?: any, opts?: ApiFetchOpts) => apiFetch<T>(url, 'POST', payload, opts),
  put: <T>(url: string, payload?: any, opts?: ApiFetchOpts) => apiFetch<T>(url, 'PUT', payload, opts),
  patch: <T>(url: string, payload?: any, opts?: ApiFetchOpts) => apiFetch<T>(url, 'PATCH', payload, opts),
  delete: <T>(url: string, opts?: ApiFetchOpts) => apiFetch<T>(url, 'DELETE', undefined, opts),
};


export async function fetchMediaClient(mediaId: string): Promise<MediaResponse | null> {
  if (!mediaId) return null;

  try {
    const res = await http.get(`/api/v1/media/${encodeURIComponent(mediaId)}`, {
      redirectOnError: false,
      throwOnError: false
    });
    if (!res) return null;
    if (typeof res === "object" && res !== null && "payload" in res) {
      return (res as any).payload as MediaResponse;
    }
    return res as MediaResponse;
  } catch {
    return null;
  }
}


export default apiFetch;