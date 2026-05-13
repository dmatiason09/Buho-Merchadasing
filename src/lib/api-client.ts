/**
 * ===================================================================
 * CLIENTE HTTP CENTRALIZADO
 * ===================================================================
 *
 * Toda comunicación entre el frontend y los endpoints (sean API Routes
 * de Next.js o un backend externo) PASA por aquí.
 *
 * Beneficios:
 * - Un solo lugar para cambiar la base URL si migramos backend
 * - Manejo de errores consistente
 * - Headers (auth tokens, content-type) en un solo lugar
 * - Type-safety end-to-end con generics
 *
 * Cuando agreguemos auth, refresh tokens, o un backend externo,
 * solo este archivo cambia.
 * ===================================================================
 */

/**
 * Por defecto las llamadas son relativas (mismo origen → API Routes).
 * Si en el futuro tenemos un backend externo (ej. en api.aymacode.com),
 * solo cambiamos esta env var y todo sigue funcionando.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

export class ApiClientError extends Error {
  status: number;
  details?: unknown;
  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.status = error.status;
    this.details = error.details;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<TResponse>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...customHeaders,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiClientError({
      message:
        err instanceof Error
          ? `Error de red: ${err.message}`
          : "Error de red desconocido",
      status: 0,
    });
  }

  // Intenta parsear JSON; si falla, devuelve texto plano para debug
  let data: unknown;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string" &&
        (data as { message: string }).message) ||
      `Error ${response.status}: ${response.statusText}`;

    throw new ApiClientError({
      message,
      status: response.status,
      details: data,
    });
  }

  return data as TResponse;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
