// src/shared/services/CadastroClientesServices.js
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

export async function buscarCep(cep) {
  const cepLimpo = String(cep || "").replace(/\D/g, "").slice(0, 8);
  if (cepLimpo.length !== 8) {
    throw new Error("CEP deve conter 8 dígitos.");
  }

  const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  if (!resposta.ok) {
    throw new Error("Erro ao consultar CEP no ViaCEP.");
  }

  const dados = await resposta.json();
  if (dados?.erro) {
    throw new Error("CEP não encontrado.");
  }

  return {
    cep: cepLimpo,
    logradouro: dados.logradouro || "",
    complemento: dados.complemento || "",
    bairro: dados.bairro || "",
    nome_municipio: String(dados.localidade || "").toUpperCase(),
    uf: String(dados.uf || "").toUpperCase(),
    codigo_ibge_municipio: String(dados.ibge || "")
      .replace(/\D/g, "")
      .slice(0, 7),
  };
}

export async function buscarCnpj(cnpj) {
  const cnpjLimpo = String(cnpj || "").replace(/\D/g, "").slice(0, 14);
  if (cnpjLimpo.length !== 14) {
    throw new Error("CNPJ deve conter 14 dígitos.");
  }

  const resposta = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`
  );

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro?.message || "CNPJ não encontrado ou inválido.");
  }

  const dados = await resposta.json();

  return {
    cnpj: cnpjLimpo,
    nome_razao_social: dados.razao_social || "",
    nome_fantasia: dados.nome_fantasia || "",
    email: dados.email || "",
    telefone: String(dados.ddd_telefone_1 || "").replace(/\D/g, ""),
    cep: String(dados.cep || "").replace(/\D/g, "").slice(0, 8),
    logradouro: [dados.descricao_tipo_de_logradouro, dados.logradouro]
      .filter(Boolean)
      .join(" ")
      .trim(),
    numero: dados.numero || "S/N",
    complemento: dados.complemento || "",
    bairro: dados.bairro || "",
    nome_municipio: String(dados.municipio || "").toUpperCase(),
    uf: String(dados.uf || "").toUpperCase(),
    codigo_ibge_municipio: String(dados.codigo_municipio_ibge || "")
      .replace(/\D/g, "")
      .slice(0, 7),
  };
}

export const cadastroClientesServices = {
  async listar() {
    const dados = await requisicao("/api/v1/clientes");
    return dados?.items || [];
  },

  async salvar(payload) {
    const dados = await requisicao("/api/v1/clientes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return dados?.item;
  },

  async excluir(id) {
    await requisicao(`/api/v1/clientes/${id}`, {
      method: "DELETE",
    });
  },
};