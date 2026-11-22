// src/modules/services/neighborhoodService.js
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

function getAuthToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("erp_ia_token") ||
    localStorage.getItem("erp_jwt_token") ||
    sessionStorage.getItem("erp_ia_token") ||
    ""
  );
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || `Erro HTTP ${response.status}`);
  }

  return data;
}

export const neighborhoodService = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.uf) {
      params.set("uf", String(filters.uf).trim().toUpperCase().slice(0, 2));
    }
    if (filters.cidade) {
      params.set("cidade", String(filters.cidade).trim());
    }

    const query = params.toString();
    const data = await request(`/api/v1/bairros${query ? `?${query}` : ""}`);
    return data?.items || [];
  },

  async save(payload) {
    const cleanPayload = {
      id: payload.id || undefined,
      uf: String(payload.uf || "").trim().toUpperCase().slice(0, 2),
      cidade_id: payload.cidade_id ? Number(payload.cidade_id) : null,
      cidade_nome: String(payload.cidade_nome || "").trim() || null,
      codigo_ibge:
        String(payload.codigo_ibge || "").replace(/\D/g, "").slice(0, 7) || null,
      nome: String(payload.nome || "").trim(),
      cep_padrao:
        String(payload.cep_padrao || "").replace(/\D/g, "").slice(0, 8) || null,
      zona: String(payload.zona || "").trim() || null,
      ativo: payload.ativo !== undefined ? Boolean(payload.ativo) : true,
    };

    const data = await request("/api/v1/bairros", {
      method: "POST",
      body: JSON.stringify(cleanPayload),
    });
    return data?.item;
  },

  async remove(id) {
    await request(`/api/v1/bairros/${id}`, {
      method: "DELETE",
    });
  },

  async listCitiesByUf(uf) {
    const cleanUf = String(uf || "").trim().toUpperCase().slice(0, 2);
    if (!/^[A-Z]{2}$/.test(cleanUf)) return [];

    const data = await request(
      `/api/v1/cidades?uf=${encodeURIComponent(cleanUf)}`
    );
    return data?.items || [];
  },
};