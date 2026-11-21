// src/modules/states/services/stateService.js
import { apiRequest } from "@/login/services/api";

export const DEFAULT_STATES = [
  { uf: "AC", nome: "Acre", codigo_ibge_uf: "12", aliquota_icms_interna: 19, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: true },
  { uf: "AL", nome: "Alagoas", codigo_ibge_uf: "27", aliquota_icms_interna: 19, aliquota_icms_interestadual: 12, fcp_percentual: 1, aplica_difal: true, suframa_area: false },
  { uf: "AM", nome: "Amazonas", codigo_ibge_uf: "13", aliquota_icms_interna: 20, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: true },
  { uf: "AP", nome: "Amapá", codigo_ibge_uf: "16", aliquota_icms_interna: 18, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: true },
  { uf: "BA", nome: "Bahia", codigo_ibge_uf: "29", aliquota_icms_interna: 20.5, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "CE", nome: "Ceará", codigo_ibge_uf: "23", aliquota_icms_interna: 20, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "DF", nome: "Distrito Federal", codigo_ibge_uf: "53", aliquota_icms_interna: 20, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "ES", nome: "Espírito Santo", codigo_ibge_uf: "32", aliquota_icms_interna: 17, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "GO", nome: "Goiás", codigo_ibge_uf: "52", aliquota_icms_interna: 19, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "MA", nome: "Maranhão", codigo_ibge_uf: "21", aliquota_icms_interna: 22, aliquota_icms_interestadual: 12, fcp_percentual: 2, aplica_difal: true, suframa_area: false },
  { uf: "MG", nome: "Minas Gerais", codigo_ibge_uf: "31", aliquota_icms_interna: 18, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "MS", nome: "Mato Grosso do Sul", codigo_ibge_uf: "50", aliquota_icms_interna: 17, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "MT", nome: "Mato Grosso", codigo_ibge_uf: "51", aliquota_icms_interna: 17, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "PA", nome: "Pará", codigo_ibge_uf: "15", aliquota_icms_interna: 19, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "PB", nome: "Paraíba", codigo_ibge_uf: "25", aliquota_icms_interna: 20, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "PE", nome: "Pernambuco", codigo_ibge_uf: "26", aliquota_icms_interna: 20.5, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "PI", nome: "Piauí", codigo_ibge_uf: "22", aliquota_icms_interna: 21, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "PR", nome: "Paraná", codigo_ibge_uf: "41", aliquota_icms_interna: 19.5, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "RJ", nome: "Rio de Janeiro", codigo_ibge_uf: "33", aliquota_icms_interna: 22, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "RN", nome: "Rio Grande do Norte", codigo_ibge_uf: "24", aliquota_icms_interna: 20, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "RO", nome: "Rondônia", codigo_ibge_uf: "11", aliquota_icms_interna: 19.5, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: true },
  { uf: "RR", nome: "Roraima", codigo_ibge_uf: "14", aliquota_icms_interna: 20, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: true },
  { uf: "RS", nome: "Rio Grande do Sul", codigo_ibge_uf: "43", aliquota_icms_interna: 17, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "SC", nome: "Santa Catarina", codigo_ibge_uf: "42", aliquota_icms_interna: 17, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "SE", nome: "Sergipe", codigo_ibge_uf: "28", aliquota_icms_interna: 19, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "SP", nome: "São Paulo", codigo_ibge_uf: "35", aliquota_icms_interna: 18, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
  { uf: "TO", nome: "Tocantins", codigo_ibge_uf: "17", aliquota_icms_interna: 20, aliquota_icms_interestadual: 12, fcp_percentual: 0, aplica_difal: true, suframa_area: false },
];

export function computeDifalPercent(item) {
  if (!item?.aplica_difal) return 0;
  const interna = Number(item.aliquota_icms_interna || 0);
  const interestadual = Number(item.aliquota_icms_interestadual || 0);
  const fcp = Number(item.fcp_percentual || 0);
  const baseDiff = interna > interestadual ? interna - interestadual : 0;
  return Number((baseDiff + fcp).toFixed(2));
}

export async function fetchStates() {
  const data = await apiRequest("/api/v1/estados");
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}

export async function saveState(payload) {
  const data = await apiRequest("/api/v1/estados", {
    method: "POST",
    body: payload,
  });
  return data?.item || data;
}

export async function removeStateById(id) {
  return apiRequest(`/api/v1/estados/${id}`, {
    method: "DELETE",
  });
}