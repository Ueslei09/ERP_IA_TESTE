// src/modules/customers/composables/useCustomerRegistration.js
import { ref, computed, watch } from "vue";
import {
  EMITTER_ORIGIN_UF,
  INITIAL_UFS,
  INITIAL_CEPS,
  INITIAL_DISTRICTS,
  RELATIONSHIP_BANKS,
  CUSTOMER_TYPES,
  PAYMENT_METHODS,
  createEmptyCustomerPayload,
  evaluateDestinationTaxRule,
  fetchCustomers,
  saveCustomerRecord,
  deleteCustomerRecord,
} from "../services/CadastroDeClientesServices.js";

function onlyDigits(value = "") {
  return String(value || "").replace(/\D+/g, "");
}

export function isValidCpf(cpf) {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === Number(digits[10]);
}

export function isValidCnpj(cnpj) {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (Number(digits[12]) !== digit1) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i += 1) {
    sum += Number(digits[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  return Number(digits[13]) === digit2;
}

export function isValidCep(cep) {
  return onlyDigits(cep).length === 8;
}

export function isValidStateRegistration(ie, uf = "") {
  const clean = String(ie || "").trim().toUpperCase();
  if (!clean) return false;
  if (clean === "ISENTO") return true;

  const digits = onlyDigits(clean);
  if (digits.length < 6 || digits.length > 14) return false;

  const stateCode = String(uf || "").toUpperCase();
  if (stateCode === "SP" && ![12, 13].includes(digits.length)) return false;
  if (stateCode === "RJ" && digits.length !== 8) return false;
  if (stateCode === "MG" && digits.length !== 13) return false;
  if (stateCode === "GO" && digits.length !== 9) return false;

  return true;
}

export function useCustomerRegistration() {
  const activeTab = ref("cadastro"); // "cadastro" | "financeiro" | "uf" | "cep" | "bairros"
  const form = ref(createEmptyCustomerPayload());
  const customers = ref([]);
  const errors = ref({});
  const feedback = ref({ type: "", message: "" });
  const isSubmitting = ref(false);

  // Tabelas auxiliares reativas
  const ufs = ref([...INITIAL_UFS]);
  const ceps = ref([...INITIAL_CEPS]);
  const districts = ref([...INITIAL_DISTRICTS]);

  // Estados de formulário das abas de manutenção
  const newUf = ref({ code: "", name: "", icmsIntrastateRate: 18, difalEnabled: true, suframaRegion: false });
  const newCep = ref({ cep: "", street: "", district: "", uf: "GO" });
  const newDistrict = ref({ name: "", uf: "GO" });

  // Filtra bairros e CEPs pela UF selecionada no endereço fiscal
  const filteredDistricts = computed(() => {
    const uf = form.value.fiscalAddress.uf;
    if (!uf) return districts.value;
    return districts.value.filter((d) => d.uf === uf);
  });

  const filteredCeps = computed(() => {
    const uf = form.value.fiscalAddress.uf;
    if (!uf) return ceps.value;
    return ceps.value.filter((c) => c.uf === uf);
  });

  // Regra fiscal dinâmica baseada na UF do destinatário, IE e SUFRAMA
  const fiscalEvaluation = computed(() =>
    evaluateDestinationTaxRule({
      originUf: EMITTER_ORIGIN_UF,
      fiscalAddress: form.value.fiscalAddress,
      stateRegistration: form.value.stateRegistration,
      suframaOptant: form.value.suframaOptant,
      ufsTable: ufs.value,
    })
  );

  // Controle comercial quando crédito concedido está marcado
  const commercialRestrictionActive = computed(() => Boolean(form.value.financial.creditGranted));

  // Se selecionar um CEP cadastrado na tabela auxiliar, preenche logradouro, bairro e UF automaticamente
  watch(
    () => form.value.fiscalAddress.cep,
    (rawCep) => {
      const clean = onlyDigits(rawCep);
      if (clean.length === 8) {
        const formatted = `${clean.slice(0, 5)}-${clean.slice(5)}`;
        form.value.fiscalAddress.cep = formatted;
        const found = ceps.value.find((entry) => onlyDigits(entry.cep) === clean);
        if (found) {
          form.value.fiscalAddress.uf = found.uf;
          form.value.fiscalAddress.street = found.street;
          form.value.fiscalAddress.district = found.district;
        }
      }
    }
  );

  // Atualiza status de contribuinte ICMS com base na Inscrição Estadual
  watch(
    () => form.value.stateRegistration,
    (ie) => {
      const clean = String(ie || "").trim().toUpperCase();
      const contributor = Boolean(clean && clean !== "ISENTO");
      form.value.fiscalAddress.icmsContributor = contributor;
      if (contributor) {
        form.value.fiscalAddress.isFinalConsumer = false;
      }
    }
  );

  function togglePaymentMethod(methodValue) {
    const list = form.value.financial.acceptedPaymentMethods;
    const idx = list.indexOf(methodValue);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(methodValue);
    }
  }

  function validateForm() {
    const nextErrors = {};
    const docDigits = onlyDigits(form.value.document);

    if (!docDigits) {
      nextErrors.document = "Informe o CPF ou CNPJ.";
    } else if (docDigits.length <= 11 && !isValidCpf(docDigits)) {
      nextErrors.document = "CPF inválido. Verifique os dígitos.";
    } else if (docDigits.length > 11 && !isValidCnpj(docDigits)) {
      nextErrors.document = "CNPJ inválido. Verifique os dígitos.";
    }

    if (!form.value.fullName.trim()) {
      nextErrors.fullName = "Nome completo / razão social é obrigatório.";
    }

    if (onlyDigits(form.value.phone).length < 10) {
      nextErrors.phone = "Informe um telefone válido com DDD.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.value.email || "").trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (!isValidCep(form.value.fiscalAddress.cep)) {
      nextErrors.cep = "CEP inválido. Use o formato 00000-000.";
    }

    if (!form.value.fiscalAddress.street.trim()) {
      nextErrors.street = "Logradouro é obrigatório para emissão fiscal.";
    }

    if (!form.value.fiscalAddress.district.trim()) {
      nextErrors.district = "Bairro é obrigatório para emissão fiscal.";
    }

    if (!form.value.fiscalAddress.uf) {
      nextErrors.uf = "Selecione a UF do destinatário (define ICMS/DIFAL).";
    }

    if (!isValidStateRegistration(form.value.stateRegistration, form.value.fiscalAddress.uf)) {
      nextErrors.stateRegistration = "Inscrição Estadual inválida ou informe ISENTO.";
    }

    if (Number(form.value.financial.maxTermDays) < 0) {
      nextErrors.maxTermDays = "Prazo máximo não pode ser negativo.";
    }

    if (Number(form.value.financial.creditLimit) < 0) {
      nextErrors.creditLimit = "Limite de crédito não pode ser negativo.";
    }

    errors.value = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  async function loadCustomers() {
    customers.value = await fetchCustomers();
  }

  async function submitCustomer() {
    feedback.value = { type: "", message: "" };
    if (!validateForm()) {
      activeTab.value = "cadastro";
      feedback.value = {
        type: "danger",
        message: "Corrija os campos destacados antes de salvar o cliente.",
      };
      return;
    }

    isSubmitting.value = true;
    try {
      const payload = {
        ...form.value,
        taxRulePreview: fiscalEvaluation.value,
      };
      const saved = await saveCustomerRecord(payload);
      const recordToStore = saved?.id ? saved : { ...payload, id: payload.id || `CLI-${Date.now()}` };

      const existingIdx = customers.value.findIndex((c) => c.id === recordToStore.id);
      if (existingIdx >= 0) {
        customers.value[existingIdx] = recordToStore;
      } else {
        customers.value.unshift(recordToStore);
      }

      feedback.value = {
        type: "success",
        message: `Cliente "${recordToStore.fullName}" salvo. ${fiscalEvaluation.value.taxSummary}`,
      };
    } catch (err) {
      feedback.value = {
        type: "warning",
        message: `Backend indisponível (${err?.message || "sem conexão"}). Registro mantido em memória local para teste.`,
      };
    } finally {
      isSubmitting.value = false;
    }
  }

  function resetCustomerForm() {
    form.value = createEmptyCustomerPayload();
    errors.value = {};
    feedback.value = { type: "", message: "" };
  }

  function editCustomer(item) {
    form.value = {
      ...createEmptyCustomerPayload(),
      ...item,
      fiscalAddress: { ...createEmptyCustomerPayload().fiscalAddress, ...(item.fiscalAddress || {}) },
      financial: { ...createEmptyCustomerPayload().financial, ...(item.financial || {}) },
    };
    activeTab.value = "cadastro";
  }

  async function removeCustomer(id) {
    customers.value = customers.value.filter((item) => item.id !== id);
    try {
      await deleteCustomerRecord(id);
    } catch {
      // Remoção local já aplicada
    }
  }

  // Manutenção: UF
  function addUf() {
    const code = String(newUf.value.code || "").toUpperCase().trim();
    const name = String(newUf.value.name || "").trim();
    if (code.length !== 2 || !name) return;

    const exists = ufs.value.some((u) => u.code === code);
    if (!exists) {
      ufs.value.push({
        code,
        name,
        icmsIntrastateRate: Number(newUf.value.icmsIntrastateRate) || 18,
        difalEnabled: Boolean(newUf.value.difalEnabled),
        suframaRegion: Boolean(newUf.value.suframaRegion),
      });
    }
    newUf.value = { code: "", name: "", icmsIntrastateRate: 18, difalEnabled: true, suframaRegion: false };
  }

  function removeUf(code) {
    ufs.value = ufs.value.filter((u) => u.code !== code);
  }

  // Manutenção: CEP
  function addCep() {
    const clean = onlyDigits(newCep.value.cep);
    if (clean.length !== 8 || !newCep.value.street.trim() || !newCep.value.district.trim()) return;

    ceps.value.push({
      id: `cep-${Date.now()}`,
      cep: `${clean.slice(0, 5)}-${clean.slice(5)}`,
      street: newCep.value.street.trim(),
      district: newCep.value.district.trim(),
      uf: newCep.value.uf,
    });
    newCep.value = { cep: "", street: "", district: "", uf: form.value.fiscalAddress.uf || "GO" };
  }

  function removeCep(id) {
    ceps.value = ceps.value.filter((c) => c.id !== id);
  }

  // Manutenção: Bairros
  function addDistrict() {
    if (!newDistrict.value.name.trim() || !newDistrict.value.uf) return;
    districts.value.push({
      id: `bai-${Date.now()}`,
      name: newDistrict.value.name.trim(),
      uf: newDistrict.value.uf,
    });
    newDistrict.value = { name: "", uf: form.value.fiscalAddress.uf || "GO" };
  }

  function removeDistrict(id) {
    districts.value = districts.value.filter((d) => d.id !== id);
  }

  return {
    activeTab,
    form,
    customers,
    errors,
    feedback,
    isSubmitting,
    ufs,
    ceps,
    districts,
    filteredDistricts,
    filteredCeps,
    newUf,
    newCep,
    newDistrict,
    fiscalEvaluation,
    commercialRestrictionActive,
    relationshipBanks: RELATIONSHIP_BANKS,
    customerTypes: CUSTOMER_TYPES,
    paymentMethods: PAYMENT_METHODS,
    togglePaymentMethod,
    validateForm,
    loadCustomers,
    submitCustomer,
    resetCustomerForm,
    editCustomer,
    removeCustomer,
    addUf,
    removeUf,
    addCep,
    removeCep,
    addDistrict,
    removeDistrict,
  };
}