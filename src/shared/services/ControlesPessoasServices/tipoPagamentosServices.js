// src/compartilhado/servicos/tipoPagamentoServico.js
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

async function requisicao(caminho, opcoes = {}) {
  const token = obterTokenSessao();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opcoes.headers || {}),
  };

  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    ...opcoes,
    headers,
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados?.message || `Erro HTTP ${resposta.status}`);
  }

  return dados;
}

export const tipoPagamentoServico = {
  async listar(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.apenasAtivos) params.set("apenasAtivos", "true");
    const query = params.toString();
    const dados = await requisicao(`/api/v1/tipos-pagamento${query ? `?${query}` : ""}`);
    return dados?.items || [];
  },

  async listarParaNegociacao({ politica = "TODOS", clienteId = null } = {}) {
    const params = new URLSearchParams();
    if (politica) params.set("politica", politica);
    if (clienteId) params.set("clienteId", String(clienteId));
    const dados = await requisicao(`/api/v1/tipos-pagamento/negociacao?${params.toString()}`);
    return dados?.items || [];
  },

  async salvar(payload) {
    const dados = await requisicao("/api/v1/tipos-pagamento", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return dados?.item;
  },

  async excluir(id) {
    await requisicao(`/api/v1/tipos-pagamento/${id}`, {
      method: "DELETE",
    });
  },
};