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
  skipAuthRedirect?: boolean;  // NEW: Skip 401 auto-redirect
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

  const finalTitle = apiError.errorTitle || custom?.title || 'Error';
  params.set('title', finalTitle);

  const finalMessage = apiError.errorMessage || custom?.message || 'An unexpected error occurred';
  params.set('msg', finalMessage);

  if (apiError.errorDescription) params.set('desc', apiError.errorDescription);

  return `${errorRoute}?${params.toString()}`;
}

function performRedirect(target: string, clientNavigate?: (path: string) => void): never {
  if (isServer) {
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
    errorMessage,
    skipAuthRedirect = false,  // NEW
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
      // Ignore cookie errors
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

    status = response.status;
    rawBody = await response.json().catch(() => null);

  } catch (err: any) {
    if (isServer && (err.digest?.startsWith('NEXT_REDIRECT') || err.message === 'NEXT_REDIRECT')) {
      throw err;
    }
    const networkMsg = err instanceof Error ? err.message : 'Network failure';
    if (throwOnError) {
      throw new HTTPError(0, networkMsg);
    }
    return null;
  }

  if (response.ok && rawBody && rawBody.success === true) {
    return rawBody.payload;
  }

  let apiError: ApiError = {
    statusCode: status,
    statusText: response.statusText,
    errorMessage: 'Unknown API Error',
    errorType: 'unknown'
  };

  if (!response.ok && rawBody && rawBody.success === false) {
    const apiErrorData = rawBody.error || {};

    apiError = {
      statusCode: apiErrorData.statusCode || status,
      statusText: apiErrorData.statusText || response.statusText,
      errorMessage: apiErrorData.errorMessage || 'Request failed',
      errorTitle: apiErrorData.errorTitle,
      errorDescription: apiErrorData.errorDescription,
      errorType: apiErrorData.errorType || 'unknown'
    };
  }

  // Don't redirect to /auth if:
  // 1. We're already calling an auth endpoint
  // 2. skipAuthRedirect is true (for media/optional fetches)
  const shouldSkipAuthRedirect = 
    endpoint.includes('/auth') || 
    endpoint.includes('/login') ||
    skipAuthRedirect;

  if (apiError.statusCode === 401 && !shouldSkipAuthRedirect) {
    performRedirect('/auth', clientNavigate);
  }

  const message = apiError.errorMessage || 'Request failed';

  if (redirectOnError && apiError.errorType === 'redirect') {
    const target = buildErrorTarget(errorRoute, apiError, status, {
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
      const target = buildErrorTarget(errorRoute, apiError, status, {
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
  // Media endpoint returns raw bytes (image) with proper Content-Type.
  // Use a direct fetch to get a Blob and expose it as an object URL so
  // components can use it as an <img src="..." />. This avoids the
  // apiFetch JSON parsing which expects wrapped JSON responses.
  const mediaUrl = `${BASE_URL}/api/v1/media/${encodeURIComponent(mediaId)}`;
  try {
    const resp = await fetch(mediaUrl, {
      method: 'GET',
      credentials: 'include',
    });

    if (!resp.ok) {
      console.warn(`Media fetch failed (${resp.status}) for ID: ${mediaId}`);
      return null;
    }

    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    return { url: objectUrl };
  } catch (err) {
    console.error(`Failed to fetch media ${mediaId}:`, err);
    return null;
  }
}


export default apiFetch;