const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

function obterTokenSessao() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("erp_ia_token") ||
    localStorage.getItem("erp_jwt_token") ||
    sessionStorage.getItem("erp_ia_token") ||
    ""
  );
}

async function requisicao(path, options = {}) {
  const token = obterTokenSessao();
  const resposta = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados?.message || `Erro HTTP ${resposta.status}`);
  }
  return dados;
}

export const departamentosService = {
  async listar(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.busca) params.set("busca", filtros.busca);
    if (filtros.ativo !== "" && filtros.ativo !== undefined) {
      params.set("ativo", String(filtros.ativo));
    }
    const qs = params.toString();
    const dados = await requisicao(`/api/v1/departamentos${qs ? `?${qs}` : ""}`);
    return Array.isArray(dados?.items) ? dados.items : Array.isArray(dados) ? dados : [];
  },

  async salvar(payload) {
    if (payload.id) {
      const dados = await requisicao(`/api/v1/departamentos/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return dados?.item || dados?.data || dados;
    }

    const dados = await requisicao("/api/v1/departamentos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return dados?.item || dados?.data || dados;
  },

  async excluir(id) {
    await requisicao(`/api/v1/departamentos/${id}`, {
      method: "DELETE",
    });
  },
};