// src/modules/customers/services/customerService.js
import { apiRequest } from "@/login/services/api";

// UF de origem padrão do emissor / loja (pode vir de configuração do tenant no backend)
export const EMITTER_ORIGIN_UF = "GO";

// UFs habilitadas na tabela auxiliar de UF (inclui estados da Zona Franca / Amazônia Ocidental para referência SUFRAMA)
export const INITIAL_UFS = [
  { code: "AC", name: "Acre", icmsIntrastateRate: 19, difalEnabled: true, suframaRegion: true },
  { code: "AL", name: "Alagoas", icmsIntrastateRate: 19, difalEnabled: true, suframaRegion: false },
  { code: "AM", name: "Amazonas", icmsIntrastateRate: 20, difalEnabled: true, suframaRegion: true },
  { code: "AP", name: "Amapá", icmsIntrastateRate: 18, difalEnabled: true, suframaRegion: true },
  { code: "BA", name: "Bahia", icmsIntrastateRate: 20.5, difalEnabled: true, suframaRegion: false },
  { code: "CE", name: "Ceará", icmsIntrastateRate: 20, difalEnabled: true, suframaRegion: false },
  { code: "DF", name: "Distrito Federal", icmsIntrastateRate: 20, difalEnabled: true, suframaRegion: false },
  { code: "ES", name: "Espírito Santo", icmsIntrastateRate: 17, difalEnabled: true, suframaRegion: false },
  { code: "GO", name: "Goiás", icmsIntrastateRate: 19, difalEnabled: true, suframaRegion: false },
  { code: "MA", name: "Maranhão", icmsIntrastateRate: 22, difalEnabled: true, suframaRegion: false },
  { code: "MG", name: "Minas Gerais", icmsIntrastateRate: 18, difalEnabled: true, suframaRegion: false },
  { code: "MS", name: "Mato Grosso do Sul", icmsIntrastateRate: 17, difalEnabled: true, suframaRegion: false },
  { code: "MT", name: "Mato Grosso", icmsIntrastateRate: 17, difalEnabled: true, suframaRegion: false },
  { code: "PA", name: "Pará", icmsIntrastateRate: 19, difalEnabled: true, suframaRegion: false },
  { code: "PB", name: "Paraíba", icmsIntrastateRate: 20, difalEnabled: true, suframaRegion: false },
  { code: "PE", name: "Pernambuco", icmsIntrastateRate: 20.5, difalEnabled: true, suframaRegion: false },
  { code: "PI", name: "Piauí", icmsIntrastateRate: 21, difalEnabled: true, suframaRegion: false },
  { code: "PR", name: "Paraná", icmsIntrastateRate: 19.5, difalEnabled: true, suframaRegion: false },
  { code: "RJ", name: "Rio de Janeiro", icmsIntrastateRate: 22, difalEnabled: true, suframaRegion: false },
  { code: "RN", name: "Rio Grande do Norte", icmsIntrastateRate: 20, difalEnabled: true, suframaRegion: false },
  { code: "RO", name: "Rondônia", icmsIntrastateRate: 19.5, difalEnabled: true, suframaRegion: true },
  { code: "RR", name: "Roraima", icmsIntrastateRate: 20, difalEnabled: true, suframaRegion: true },
  { code: "RS", name: "Rio Grande do Sul", icmsIntrastateRate: 17, difalEnabled: true, suframaRegion: false },
  { code: "SC", name: "Santa Catarina", icmsIntrastateRate: 17, difalEnabled: true, suframaRegion: false },
  { code: "SE", name: "Sergipe", icmsIntrastateRate: 19, difalEnabled: true, suframaRegion: false },
  { code: "SP", name: "São Paulo", icmsIntrastateRate: 18, difalEnabled: true, suframaRegion: false },
  { code: "TO", name: "Tocantins", icmsIntrastateRate: 20, difalEnabled: true, suframaRegion: false },
];

// Tabela auxiliar de CEPs (vinculada a UF e Bairro)
export const INITIAL_CEPS = [
  { id: "cep-1", cep: "74000-010", street: "Av. Goiás", district: "Centro", uf: "GO" },
  { id: "cep-2", cep: "74810-090", street: "Av. T-63", district: "Setor Bueno", uf: "GO" },
  { id: "cep-3", cep: "01310-100", street: "Av. Paulista", district: "Bela Vista", uf: "SP" },
  { id: "cep-4", cep: "69005-040", street: "Rua Guilherme Moreira", district: "Centro", uf: "AM" },
];

// Tabela auxiliar de Bairros (vinculada a UF)
export const INITIAL_DISTRICTS = [
  { id: "bai-1", name: "Centro", uf: "GO" },
  { id: "bai-2", name: "Setor Bueno", uf: "GO" },
  { id: "bai-3", name: "Bela Vista", uf: "SP" },
  { id: "bai-4", name: "Centro", uf: "AM" },
];

export const RELATIONSHIP_BANKS = [
  { code: "001", name: "Banco do Brasil" },
  { code: "033", name: "Santander" },
  { code: "104", name: "Caixa Econômica Federal" },
  { code: "237", name: "Bradesco" },
  { code: "341", name: "Itaú Unibanco" },
  { code: "756", name: "Sicoob" },
];

export const CUSTOMER_TYPES = [
  { value: "varejo", label: "Varejo" },
  { value: "atacado", label: "Atacado" },
  { value: "industria", label: "Indústria" },
  { value: "revendedor", label: "Revendedor" },
];

export const PAYMENT_METHODS = [
  { value: "a_vista", label: "À Vista" },
  { value: "prazo", label: "A Prazo" },
  { value: "cheque", label: "Cheque" },
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "cartao", label: "Cartão" },
];

/**
 * Entidade padrão de endereço fiscal e dados do cliente.
 * O endereço fiscal é tratado como entidade estruturada para alimentar ICMS, DIFAL e NF-e.
 */
export function createEmptyCustomerPayload() {
  return {
    id: null,
    document: "", // CPF ou CNPJ
    fullName: "",
    phone: "",
    email: "",
    stateRegistration: "", // Inscrição Estadual (ou "ISENTO")
    municipalRegistration: "", // Inscrição Municipal
    suframaOptant: false,
    suframaCode: "",
    fiscalAddress: {
      cep: "",
      street: "",
      district: "",
      uf: "",
      countryCode: "1058", // Brasil (BACEN/IBGE)
      isFinalConsumer: true, // Consumidor final (impacta diretamente o DIFAL)
      icmsContributor: false, // Contribuinte ICMS (IE válida / não isento)
    },
    financial: {
      customerType: "varejo", // varejo | atacado | industria | revendedor
      maxTermDays: 30,
      acceptedPaymentMethods: ["a_vista", "pix"],
      relationshipBankCode: "001",
      creditLimit: 0,
      creditGranted: false, // Quando true: libera comercial somente para movimentação bancária ou baixa de títulos
      balanceAmount: 0,
    },
  };
}

/**
 * PONTO EXPLÍCITO DE APLICAÇÃO DA REGRA FISCAL (UF DO DESTINATÁRIO + DIFAL + SUFRAMA)
 * Chamado sempre que o endereço fiscal (UF/CEP), IE ou flag SUFRAMA mudam e antes da emissão de NF-e.
 */
export function evaluateDestinationTaxRule({
  originUf = EMITTER_ORIGIN_UF,
  fiscalAddress,
  stateRegistration,
  suframaOptant,
  ufsTable = INITIAL_UFS,
}) {
  const destinationUf = String(fiscalAddress?.uf || "").toUpperCase().trim();
  const cleanIe = String(stateRegistration || "").toUpperCase().trim();
  const isContributor = Boolean(cleanIe && cleanIe !== "ISENTO");
  const isFinalConsumer = !isContributor || Boolean(fiscalAddress?.isFinalConsumer);
  const ufMeta = ufsTable.find((item) => item.code === destinationUf) || null;

  if (!destinationUf) {
    return {
      destinationUf: "",
      originUf,
      operationScope: "undefined",
      difalApplies: false,
      suframaApplies: false,
      taxSummary: "Informe a UF do destinatário para calcular ICMS, DIFAL e regras fiscais.",
    };
  }

  const isInterstate = destinationUf !== originUf;

  // Regra SUFRAMA: se optante e em UF da área de incentivo/SUFRAMA, sinaliza regime especial para NF-e
  const suframaApplies = Boolean(suframaOptant && ufMeta?.suframaRegion);

  // Regra DIFAL: operação interestadual (UF destino != UF origem) envolvendo consumidor final (não contribuinte de ICMS)
  const difalApplies = isInterstate && isFinalConsumer;

  let taxSummary = "";
  if (!isInterstate) {
    taxSummary = `Operação interna (${originUf} -> ${destinationUf}): aplica alíquota interna de ICMS (${ufMeta?.icmsIntrastateRate ?? "N/D"}%). Sem DIFAL.`;
  } else if (difalApplies) {
    taxSummary = `Operação interestadual (${originUf} -> ${destinationUf}) com consumidor final: DIFAL APLICÁVEL na emissão da nota (UF destino: ${destinationUf}).`;
  } else if (suframaApplies) {
    taxSummary = `Operação interestadual (${originUf} -> ${destinationUf}) com optante SUFRAMA: verificar isenção/desoneração de ICMS/PIS/COFINS na NF-e.`;
  } else {
    taxSummary = `Operação interestadual (${originUf} -> ${destinationUf}) para contribuinte/revenda: aplica alíquota interestadual de ICMS; DIFAL não se aplica à operação direta.`;
  }

  return {
    destinationUf,
    originUf,
    operationScope: isInterstate ? "interstate" : "intrastate",
    isContributor,
    isFinalConsumer,
    difalApplies,
    suframaApplies,
    ufMeta,
    taxSummary,
  };
}

export async function fetchCustomers() {
  try {
    const data = await apiRequest("/api/erp/customers");
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.customers)) return data.customers;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch {
    return [];
  }
}

export async function saveCustomerRecord(payload) {
  const method = payload.id ? "PUT" : "POST";
  const endpoint = payload.id ? `/api/erp/customers/${payload.id}` : "/api/erp/customers";
  return apiRequest(endpoint, {
    method,
    body: payload,
  });
}

export async function deleteCustomerRecord(id) {
  return apiRequest(`/api/erp/customers/${id}`, {
    method: "DELETE",
  });
}