import { apiRequest } from "../../login/services/api"; // troque para apiFetch se for esse o nome no seu api.js

export async function listErpRecords() {
  const data = await apiRequest("/api/erp/records");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function createErpRecord(title) {
  return apiRequest("/api/erp/records", {
    method: "POST",
    body: {
      title: String(title || "").trim(),
      category: "teste",
      amount: 100,
      status: "ativo",
    },
  });
}

export async function removeErpRecord(id) {
  return apiRequest(`/api/erp/records/${id}`, {
    method: "DELETE",
  });
}