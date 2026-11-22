// src/modules/cities/composables/useCityRegistration.js
import { ref, computed } from "vue";
import { fetchCities, saveCity, removeCityById } from "@/shared/services/ControlesPessoasServices/cityServices";
import { fetchStates } from "@/shared/services/ControlesPessoasServices/stateService";

function createEmptyForm() {
  return {
    id: null,
    estado_id: null,
    uf: "",
    nome: "",
    codigo_ibge: "",
    cep_padrao: "",
    ativo: true,
  };
}

export function useCityRegistration() {
  const cities = ref([]);
  const availableStates = ref([]);
  const form = ref(createEmptyForm());
  const searchQuery = ref("");
  const filterUf = ref("");
  const feedback = ref({ type: "", message: "" });
  const isLoading = ref(false);
  const isSaving = ref(false);

  const filteredCities = computed(() => {
    const q = String(searchQuery.value || "").trim().toLowerCase();
    const uf = String(filterUf.value || "").trim().toUpperCase();

    return cities.value.filter((c) => {
      const matchesUf = !uf || String(c.uf || "").toUpperCase() === uf;
      const matchesText =
        !q ||
        String(c.nome || "").toLowerCase().includes(q) ||
        String(c.codigo_ibge || "").toLowerCase().includes(q) ||
        String(c.uf || "").toLowerCase().includes(q);
      return matchesUf && matchesText;
    });
  });

  async function loadCitiesAndStates() {
    isLoading.value = true;
    feedback.value = { type: "", message: "" };
    try {
      const [cityList, stateList] = await Promise.all([
        fetchCities(),
        fetchStates().catch(() => []),
      ]);
      cities.value = cityList;
      availableStates.value = stateList;
    } catch (err) {
      feedback.value = {
        type: "warning",
        message: err?.message || "Não foi possível carregar as cidades.",
      };
    } finally {
      isLoading.value = false;
    }
  }

  function onSelectUf() {
    const cleanUf = String(form.value.uf || "").trim().toUpperCase();
    form.value.uf = cleanUf;
    const matched = availableStates.value.find((s) => String(s.uf).toUpperCase() === cleanUf);
    form.value.estado_id = matched?.id ?? null;
  }

  async function submitCity() {
    feedback.value = { type: "", message: "" };
    const cleanUf = String(form.value.uf || "").trim().toUpperCase();
    const cleanNome = String(form.value.nome || "").trim();
    const cleanIbge = String(form.value.codigo_ibge || "").replace(/\D/g, "").trim();
    const cleanCep = String(form.value.cep_padrao || "").replace(/\D/g, "").trim();

    if (!/^[A-Z]{2}$/.test(cleanUf) || !cleanNome || !/^\d{7}$/.test(cleanIbge)) {
      feedback.value = {
        type: "danger",
        message: "Informe UF (2 letras), nome da cidade e código IBGE com 7 dígitos.",
      };
      return;
    }

    onSelectUf();
    isSaving.value = true;

    try {
      const saved = await saveCity({
        ...form.value,
        uf: cleanUf,
        nome: cleanNome,
        codigo_ibge: cleanIbge,
        cep_padrao: cleanCep || null,
      });

      const idx = cities.value.findIndex(
        (c) => c.codigo_ibge === saved.codigo_ibge || (saved.id && c.id === saved.id)
      );
      if (idx >= 0) {
        cities.value[idx] = saved;
      } else {
        cities.value.push(saved);
        cities.value.sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
      }

      resetForm();
      feedback.value = {
        type: "success",
        message: `Cidade ${saved.nome} - ${saved.uf} (IBGE ${saved.codigo_ibge}) salva com sucesso.`,
      };
    } catch (err) {
      feedback.value = {
        type: "danger",
        message: err?.message || "Erro ao salvar cidade no banco.",
      };
    } finally {
      isSaving.value = false;
    }
  }

  function editCity(item) {
    form.value = {
      id: item.id,
      estado_id: item.estado_id ?? null,
      uf: item.uf || "",
      nome: item.nome || "",
      codigo_ibge: item.codigo_ibge || "",
      cep_padrao: item.cep_padrao || "",
      ativo: item.ativo !== undefined ? Boolean(item.ativo) : true,
    };
  }

  async function deleteCity(item) {
    feedback.value = { type: "", message: "" };
    try {
      await removeCityById(item.id);
      cities.value = cities.value.filter((c) => c.id !== item.id);
      feedback.value = {
        type: "success",
        message: `Cidade ${item.nome} - ${item.uf} removida.`,
      };
    } catch (err) {
      feedback.value = {
        type: "danger",
        message: err?.message || "Erro ao remover cidade.",
      };
    }
  }

  function resetForm() {
    form.value = createEmptyForm();
  }

  return {
    cities,
    availableStates,
    filteredCities,
    form,
    searchQuery,
    filterUf,
    feedback,
    isLoading,
    isSaving,
    loadCitiesAndStates,
    onSelectUf,
    submitCity,
    editCity,
    deleteCity,
    resetForm,
  };
}