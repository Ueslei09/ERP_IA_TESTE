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

export const relatorioClientesServices = {
  async buscar(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.busca) params.set("busca", filtros.busca);
    if (filtros.perfil_cliente && filtros.perfil_cliente !== "TODOS") {
      params.set("perfil_cliente", filtros.perfil_cliente);
    }
    if (filtros.tipo_operacao && filtros.tipo_operacao !== "TODOS") {
      params.set("tipo_operacao", filtros.tipo_operacao);
    }
    if (filtros.uf && filtros.uf !== "TODOS") {
      params.set("uf", filtros.uf);
    }
    if (filtros.ativo !== "" && filtros.ativo !== undefined) {
      params.set("ativo", String(filtros.ativo));
    }

    const token = obterTokenSessao();
    const qs = params.toString();
    const url = `${API_BASE_URL}/api/v1/relatorios/clientes${qs ? `?${qs}` : ""}`;

    const resposta = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      throw new Error(dados?.message || `Erro HTTP ${resposta.status}`);
    }

    return {
      items: Array.isArray(dados?.items) ? dados.items : [],
      resumo: dados?.resumo || {
        total: 0,
        ativos: 0,
        inativos: 0,
        limiteCreditoTotal: 0,
        saldoDisponivelTotal: 0,
      },
    };
  },
};

// Alias caso algum import use o singular
export const relatorioClientesService = relatorioClientesServices;