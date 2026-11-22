const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

const PERFIS_PADRAO = [
  { codigo: "PADRAO", descricao: "Padrão", ativo: true },
  { codigo: "VAREJO", descricao: "Varejo", ativo: true },
  { codigo: "ATACADO", descricao: "Atacado", ativo: true },
  { codigo: "VIP", descricao: "VIP", ativo: true },
];

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

export const perfilClienteServices = {
  async listar() {
    try {
      const dados = await requisicao("/api/v1/perfis-cliente");
      const lista = Array.isArray(dados) ? dados : dados?.items || [];
      return lista.length > 0 ? lista : PERFIS_PADRAO;
    } catch {
      return PERFIS_PADRAO;
    }
  },

  async salvar(payload) {
    const dados = await requisicao("/api/v1/perfis-cliente", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return dados?.item || payload;
  },

  async excluir(id) {
    await requisicao(`/api/v1/perfis-cliente/${id}`, {
      method: "DELETE",
    });
  },
};