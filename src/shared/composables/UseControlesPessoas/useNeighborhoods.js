// src/shared/composables/UseControlesPessoas/useNeighborhoods.js
import { ref, computed, watch } from "vue";
import { neighborhoodService } from "@/shared/services/ControlesPessoasServices/neighborhoodService.js";

const INITIAL_FORM = () => ({
  id: null,
  uf: "GO",
  cidade_id: null,
  cidade_nome: "",
  codigo_ibge: "",
  nome: "",
  cep_padrao: "",
  zona: "",
  ativo: true,
});

export function useNeighborhoods() {
  const items = ref([]);
  const cities = ref([]);
  const form = ref(INITIAL_FORM());
  const loading = ref(false);
  const saving = ref(false);
  const errorMessage = ref("");
  const successMessage = ref("");

  const filterUf = ref("");
  const searchQuery = ref("");

  const filteredItems = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return items.value.filter((row) => {
      const matchesUf = !filterUf.value || row.uf === filterUf.value;
      if (!matchesUf) return false;
      if (!q) return true;

      return (
        String(row.nome || "").toLowerCase().includes(q) ||
        String(row.cidade_nome || "").toLowerCase().includes(q) ||
        String(row.zona || "").toLowerCase().includes(q) ||
        String(row.cep_padrao || "").includes(q)
      );
    });
  });

  function clearMessages() {
    errorMessage.value = "";
    successMessage.value = "";
  }

  function resetForm() {
    form.value = INITIAL_FORM();
    clearMessages();
  }

  function editNeighborhood(row) {
    clearMessages();
    form.value = {
      id: row.id ?? null,
      uf: String(row.uf || "GO").toUpperCase().slice(0, 2),
      cidade_id: row.cidade_id ?? null,
      cidade_nome: row.cidade_nome || "",
      codigo_ibge: row.codigo_ibge || "",
      nome: row.nome || "",
      cep_padrao: row.cep_padrao || "",
      zona: row.zona || "",
      ativo: row.ativo !== undefined ? Boolean(row.ativo) : true,
    };
  }

  async function loadCitiesForUf(uf) {
    const cleanUf = String(uf || "").trim().toUpperCase().slice(0, 2);
    if (!/^[A-Z]{2}$/.test(cleanUf)) {
      cities.value = [];
      return;
    }
    try {
      cities.value = await neighborhoodService.listCitiesByUf(cleanUf);
    } catch {
      cities.value = [];
    }
  }

  function onSelectCity(cityId) {
    const found = cities.value.find((c) => Number(c.id) === Number(cityId));
    if (found) {
      form.value.cidade_id = found.id;
      form.value.cidade_nome = found.nome;
      form.value.codigo_ibge = found.codigo_ibge || "";
    } else {
      form.value.cidade_id = null;
      form.value.codigo_ibge = "";
    }
  }

  async function fetchNeighborhoods() {
    loading.value = true;
    errorMessage.value = "";
    try {
      items.value = await neighborhoodService.list({ uf: filterUf.value });
    } catch (err) {
      errorMessage.value =
        err?.response?.data?.message || err?.message || "Erro ao carregar bairros.";
    } finally {
      loading.value = false;
    }
  }

  async function saveNeighborhood() {
    clearMessages();
    const ufClean = String(form.value.uf || "").trim().toUpperCase().slice(0, 2);
    const nomeClean = String(form.value.nome || "").trim();

    if (!/^[A-Z]{2}$/.test(ufClean) || !nomeClean) {
      errorMessage.value = "Informe UF (2 letras) e o nome do bairro.";
      return;
    }

    saving.value = true;
    try {
      await neighborhoodService.save({
        ...form.value,
        uf: ufClean,
        nome: nomeClean,
      });
      await fetchNeighborhoods();
      resetForm();
      successMessage.value = "Bairro salvo com sucesso!";
    } catch (err) {
      errorMessage.value =
        err?.response?.data?.message || err?.message || "Erro ao salvar bairro.";
    } finally {
      saving.value = false;
    }
  }

  async function deleteNeighborhood(id) {
    clearMessages();
    try {
      await neighborhoodService.remove(id);
      successMessage.value = "Bairro removido com sucesso.";
      items.value = items.value.filter((item) => item.id !== id);
    } catch (err) {
      errorMessage.value =
        err?.response?.data?.message || err?.message || "Erro ao excluir bairro.";
    }
  }

  watch(
    () => form.value.uf,
    (newUf) => {
      loadCitiesForUf(newUf);
    },
    { immediate: true }
  );

  return {
    items,
    cities,
    filteredItems,
    form,
    loading,
    saving,
    errorMessage,
    successMessage,
    filterUf,
    searchQuery,
    resetForm,
    editNeighborhood,
    onSelectCity,
    fetchNeighborhoods,
    saveNeighborhood,
    deleteNeighborhood,
  };
}