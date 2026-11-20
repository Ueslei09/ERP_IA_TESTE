import { ref } from "vue";
import {
  listErpRecords,
  createErpRecord,
  removeErpRecord,
} from "../services/homeErpService";

export function useHomeErp(router = null) {
  const records = ref([]);
  const title = ref("");
  const statusMessage = ref("");
  const isLoading = ref(false);

  async function loadRecords() {
    isLoading.value = true;
    try {
      records.value = await listErpRecords();
      statusMessage.value = "Conectado ao backend com sucesso!";
    } catch (err) {
      statusMessage.value = `Erro: ${err?.message || "Falha ao carregar."}`;
    } finally {
      isLoading.value = false;
    }
  }

  async function addRecord() {
    const cleanTitle = title.value.trim();
    if (!cleanTitle) return;

    try {
      await createErpRecord(cleanTitle);
      title.value = "";
      await loadRecords();
    } catch (err) {
      statusMessage.value = `Erro ao salvar: ${err?.message || "Falha ao criar."}`;
    }
  }

  async function deleteRecord(id) {
    try {
      await removeErpRecord(id);
      await loadRecords();
    } catch (err) {
      statusMessage.value = `Erro ao excluir: ${err?.message || "Falha ao excluir."}`;
    }
  }

  async function logout() {
    localStorage.removeItem("erp_ia_token");
    localStorage.removeItem("erp_jwt_token");
    localStorage.removeItem("erp_auth_user");
    sessionStorage.removeItem("erp_ia_token");
    if (router?.push) {
      await router.push({ name: "login" });
    }
  }

  return {
    records,
    title,
    statusMessage,
    isLoading,
    loadRecords,
    addRecord,
    deleteRecord,
    logout,
  };
}