/**
 * API fetch 래퍼
 *
 * - credentials: 'include' 자동 포함 (httpOnly 쿠키 전송)
 * - 401 응답 시 /api/auth/refresh 자동 시도 → 실패 시 /login 리디렉트
 * - JSON 요청/응답 자동 처리
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ApiError {
  error: string
  statusCode: number
}

// refresh 중복 요청 방지 플래그
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

/**
 * /api/auth/refresh 호출 → 성공 여부 반환
 */
async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false
      refreshPromise = null
    })

  return refreshPromise
}

/**
 * API 호출 옵션 타입
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/**
 * API 호출 함수
 *
 * @param path - API 경로 (예: '/api/auth/login')
 * @param options - fetch 옵션 (body는 자동으로 JSON 직렬화)
 * @param retried - 내부 재시도 플래그 (무한 루프 방지)
 */
async function apiFetch<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
  retried = false,
): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // 401 응답이고 아직 재시도 안 했으면 refresh 시도
  if (response.status === 401 && !retried) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return apiFetch<T>(path, options, true)
    }
    // refresh 실패 → /login으로 리디렉트
    window.location.href = '/login'
    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.')
  }

  // 응답 파싱
  let data: unknown
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const err = data as { error?: string }
    throw {
      error: err?.error || '요청을 처리하는 중 오류가 발생했습니다',
      statusCode: response.status,
    } as ApiError
  }

  return data as T
}

export const api = {
  get: <T = unknown>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),

  post: <T = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),

  patch: <T = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
}
