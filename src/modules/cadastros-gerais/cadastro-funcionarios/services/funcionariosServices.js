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

export const funcionariosService = {
  async listar(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.busca) params.set("busca", filtros.busca);
    if (filtros.tipo_funcionario && filtros.tipo_funcionario !== "TODOS") {
      params.set("tipo_funcionario", filtros.tipo_funcionario);
    }
    if (filtros.departamento_id) {
      params.set("departamento_id", String(filtros.departamento_id));
    }
    if (filtros.ativo !== "" && filtros.ativo !== undefined) {
      params.set("ativo", String(filtros.ativo));
    }
    const qs = params.toString();
    const dados = await requisicao(`/api/v1/funcionarios${qs ? `?${qs}` : ""}`);
    return Array.isArray(dados?.items) ? dados.items : Array.isArray(dados) ? dados : [];
  },

  async buscarEnderecoPorCep(cep) {
    const digitos = String(cep || "").replace(/\D/g, "");
    const params = new URLSearchParams({ cep: digitos });
    return requisicao(`/api/v1/funcionarios/endereco-cep?${params.toString()}`);
  },

  async buscarVinculosPorCpf(cpf) {
    const digitos = String(cpf || "").replace(/\D/g, "");
    const params = new URLSearchParams({ cpf: digitos });
    return requisicao(`/api/v1/funcionarios/vinculos-cpf?${params.toString()}`);
  },

  async listarDepartamentos() {
    const dados = await requisicao("/api/v1/departamentos");
    return Array.isArray(dados?.items) ? dados.items : Array.isArray(dados) ? dados : [];
  },

  async salvar(payload) {
    if (payload.id) {
      const dados = await requisicao(`/api/v1/funcionarios/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return dados?.item || dados?.data || dados;
    }

    const dados = await requisicao("/api/v1/funcionarios", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return dados?.item || dados?.data || dados;
  },

  async excluir(id) {
    await requisicao(`/api/v1/funcionarios/${id}`, {
      method: "DELETE",
    });
  },
};