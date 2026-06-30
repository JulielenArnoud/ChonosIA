const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";
const API_KEY = import.meta.env.VITE_API_KEY;
export const AWS_URL = import.meta.env.VITE_AWS_URL || API_BASE_URL;


export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? (options.body ? "POST" : "GET");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers: {
      ...(options.body && method !== "GET" && method !== "HEAD"
        ? { "Content-Type": "application/json" }
        : {}),
      ...(API_KEY ? { "x-api-key": API_KEY } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message = typeof data === "string"
      ? data
      : data?.message || "Falha na requisição";

    throw new Error(message);
  }

  return data as T;
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
