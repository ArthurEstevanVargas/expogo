import { getAdminApiKey, getApiBaseUrl } from '@/config/env';
import { clearAccessToken, getAccessToken } from '@/lib/http/auth-token';
import type { ApiErrorBody, ApiRequestOptions } from '@/types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(params: { status: number; code: string; message: string; details?: unknown }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { admin, auth, body, ...requestOptions } = options;
  const token = auth === false ? null : getAccessToken();
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (admin) {
    headers.set('x-api-key', getAdminApiKey());
  }

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const errorPayload = payload as Partial<ApiErrorBody> | undefined;
    const fallbackPayload = payload as { message?: string; statusCode?: number } | undefined;

    if (response.status === 401) {
      clearAccessToken();
    }

    throw new ApiError({
      status: response.status,
      code: errorPayload?.code ?? 'HTTP_ERROR',
      message:
        errorPayload?.message ??
        fallbackPayload?.message ??
        'Nao foi possivel completar a solicitacao.',
      details: payload,
    });
  }

  return payload as T;
}
