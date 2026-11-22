// src/modules/cities/services/cityService.js
import { apiRequest } from "@/login/services/api";

export async function fetchCities(uf = "") {
  const query = uf ? `?uf=${encodeURIComponent(String(uf).toUpperCase())}` : "";
  const data = await apiRequest(`/api/v1/cidades${query}`);
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}

export async function saveCity(payload) {
  const data = await apiRequest("/api/v1/cidades", {
    method: "POST",
    body: payload,
  });
  return data?.item || data;
}

export async function removeCityById(id) {
  return apiRequest(`/api/v1/cidades/${id}`, {
    method: "DELETE",
  });
}