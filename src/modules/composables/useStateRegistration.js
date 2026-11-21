// src/modules/states/composables/useStateRegistration.js
import { ref, computed, watch } from "vue";
import {
  DEFAULT_STATES,
  computeDifalPercent,
  fetchStates,
  saveState,
  removeStateById,
} from "../services/stateService";

function createEmptyForm() {
  return {
    id: null,
    uf: "",
    nome: "",
    codigo_ibge_uf: "",
    aliquota_icms_interna: 18,
    aliquota_icms_interestadual: 12,
    fcp_percentual: 0,
    aliquota_difal: 6,
    aplica_difal: true,
    suframa_area: false,
    ativo: true,
  };
}

export function useStateRegistration() {
  const states = ref([]);
  const form = ref(createEmptyForm());
  const searchUf = ref("");
  const feedback = ref({ type: "", message: "" });
  const isLoading = ref(false);
  const isSaving = ref(false);

  const calculatedDifal = computed(() => computeDifalPercent(form.value));

  watch(
    () => [
      form.value.aliquota_icms_interna,
      form.value.aliquota_icms_interestadual,
      form.value.fcp_percentual,
      form.value.aplica_difal,
    ],
    () => {
      form.value.aliquota_difal = calculatedDifal.value;
    },
    { immediate: true }
  );

  const filteredStates = computed(() => {
    const q = String(searchUf.value || "").trim().toLowerCase();
    if (!q) return states.value;
    return states.value.filter(
      (s) =>
        String(s.uf || "").toLowerCase().includes(q) ||
        String(s.nome || "").toLowerCase().includes(q)
    );
  });

  async function loadStates() {
    isLoading.value = true;
    feedback.value = { type: "", message: "" };
    try {
      const list = await fetchStates();
      states.value = list.map((item) => ({
        ...item,
        aliquota_difal:
          item.aliquota_difal !== undefined && item.aliquota_difal !== null
            ? Number(item.aliquota_difal)
            : computeDifalPercent(item),
      }));
    } catch (err) {
      feedback.value = {
        type: "warning",
        message: err?.message || "Não foi possível carregar os estados do backend.",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function submitState() {
    feedback.value = { type: "", message: "" };
    const cleanUf = String(form.value.uf || "").trim().toUpperCase();
    const cleanNome = String(form.value.nome || "").trim();

    if (!/^[A-Z]{2}$/.test(cleanUf) || !cleanNome) {
      feedback.value = {
        type: "danger",
        message: "Informe uma UF válida com 2 letras e o nome do estado.",
      };
      return;
    }

    isSaving.value = true;
    try {
      const payload = {
        ...form.value,
        uf: cleanUf,
        nome: cleanNome,
        aliquota_difal: calculatedDifal.value,
      };
      const saved = await saveState(payload);
      const idx = states.value.findIndex((s) => s.uf === saved.uf || (saved.id && s.id === saved.id));
      if (idx >= 0) {
        states.value[idx] = saved;
      } else {
        states.value.push(saved);
        states.value.sort((a, b) => String(a.uf).localeCompare(String(b.uf)));
      }
      resetForm();
      feedback.value = {
        type: "success",
        message: `Estado ${saved.uf} (${saved.nome}) salvo com ICMS interno ${saved.aliquota_icms_interna}% e DIFAL ${saved.aliquota_difal}%.`,
      };
    } catch (err) {
      feedback.value = {
        type: "danger",
        message: err?.message || "Erro ao salvar estado no banco.",
      };
    } finally {
      isSaving.value = false;
    }
  }

  async function seedDefaultStates() {
    isSaving.value = true;
    feedback.value = { type: "", message: "" };
    try {
      for (const item of DEFAULT_STATES) {
        await saveState({
          ...item,
          aliquota_difal: computeDifalPercent(item),
          ativo: true,
        });
      }
      await loadStates();
      feedback.value = {
        type: "success",
        message: "Todas as 27 UFs padrão foram carregadas e salvas para a empresa ativa.",
      };
    } catch (err) {
      feedback.value = {
        type: "danger",
        message: err?.message || "Erro ao carregar tabela padrão de UFs.",
      };
    } finally {
      isSaving.value = false;
    }
  }

  function editState(item) {
    form.value = {
      id: item.id,
      uf: item.uf,
      nome: item.nome,
      codigo_ibge_uf: item.codigo_ibge_uf || "",
      aliquota_icms_interna: Number(item.aliquota_icms_interna ?? 18),
      aliquota_icms_interestadual: Number(item.aliquota_icms_interestadual ?? 12),
      fcp_percentual: Number(item.fcp_percentual ?? 0),
      aliquota_difal: Number(item.aliquota_difal ?? computeDifalPercent(item)),
      aplica_difal: Boolean(item.aplica_difal),
      suframa_area: Boolean(item.suframa_area),
      ativo: item.ativo !== undefined ? Boolean(item.ativo) : true,
    };
  }

  async function deleteState(item) {
    feedback.value = { type: "", message: "" };
    try {
      await removeStateById(item.id);
      states.value = states.value.filter((s) => s.id !== item.id);
      feedback.value = {
        type: "success",
        message: `Estado ${item.uf} removido.`,
      };
    } catch (err) {
      feedback.value = {
        type: "danger",
        message: err?.message || "Erro ao remover estado.",
      };
    }
  }

  function resetForm() {
    form.value = createEmptyForm();
  }

  return {
    states,
    filteredStates,
    form,
    searchUf,
    feedback,
    isLoading,
    isSaving,
    calculatedDifal,
    loadStates,
    submitState,
    seedDefaultStates,
    editState,
    deleteState,
    resetForm,
  };
}