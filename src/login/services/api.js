const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");

export function getToken() {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem("erp_ia_token") || "";
}

export async function apiRequest(endpoint, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Erro HTTP ${response.status}`);
  }

  return data;
}