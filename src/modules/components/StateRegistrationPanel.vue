<!-- src/modules/states/components/StateRegistrationPanel.vue -->
<template>
  <section class="erp-state-module py-4 py-md-5 min-vh-100">
    <div class="container-fluid px-3 px-lg-4">
      <!-- Cabeçalho -->
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
        <div>
          <span class="badge bg-white border border-black text-black mb-2">
            <i class="bi bi-folder2-open me-1" aria-hidden="true"></i>
            Operações • Cadastros Gerais • Pessoas • 1º Estado (UF / ICMS / DIFAL)
          </span>
          <h1 class="h4 fw-bold text-black mb-1">
            <i class="bi bi-map me-2 text-black" aria-hidden="true"></i>
            Cadastro de Estados (UF, ICMS e DIFAL)
          </h1>
          <p class="text-black small mb-0">
            Tabela base usada em cadastros, endereços, cálculo de ICMS/DIFAL e emissão de notas fiscais.
          </p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-outline-dark btn-sm erp-hover-btn" @click="goToHome">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Voltar ao Home
          </button>
          <button
            type="button"
            class="btn btn-outline-dark btn-sm erp-hover-btn"
            :disabled="isSaving"
            @click="seedDefaultStates"
          >
            <i class="bi bi-cloud-download me-1" aria-hidden="true"></i>
            Carregar 27 UFs Padrão
          </button>
          <button type="button" class="btn btn-outline-dark btn-sm erp-hover-btn" @click="resetForm">
            <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
            Limpar
          </button>
          <button
            type="button"
            class="btn btn-dark text-white fw-semibold btn-sm erp-hover-btn"
            :disabled="isSaving"
            @click="submitState"
          >
            <i class="bi bi-check2-circle me-1" aria-hidden="true"></i>
            {{ isSaving ? "Salvando..." : "Salvar Estado" }}
          </button>
        </div>
      </div>

      <!-- Feedback -->
      <div
        v-if="feedback.message"
        :class="['alert', `alert-${feedback.type || 'info'}`, 'text-black d-flex align-items-center gap-2 py-2 small']"
        role="alert"
      >
        <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
        <span>{{ feedback.message }}</span>
      </div>

      <!-- Formulário de Estado (UF, ICMS e DIFAL) -->
      <form class="erp-card rounded-3 p-3 p-md-4 mb-4" @submit.prevent="submitState">
        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-sliders me-2 text-black" aria-hidden="true"></i>
          Dados e Alíquotas Fiscais da UF
        </h2>

        <div class="row g-3">
          <div class="col-6 col-md-2">
            <label class="form-label text-black small fw-semibold">UF *</label>
            <input
              v-model="form.uf"
              type="text"
              maxlength="2"
              class="form-control erp-input text-uppercase"
              placeholder="GO"
            />
          </div>

          <div class="col-6 col-md-4">
            <label class="form-label text-black small fw-semibold">Nome do Estado *</label>
            <input
              v-model="form.nome"
              type="text"
              class="form-control erp-input"
              placeholder="Goiás"
            />
          </div>

          <div class="col-6 col-md-2">
            <label class="form-label text-black small fw-semibold">Cód. IBGE UF</label>
            <input
              v-model="form.codigo_ibge_uf"
              type="text"
              maxlength="2"
              class="form-control erp-input"
              placeholder="52"
            />
          </div>

          <div class="col-6 col-md-4">
            <label class="form-label text-black small fw-semibold">Alíquota ICMS Interna (%)</label>
            <input
              v-model.number="form.aliquota_icms_interna"
              type="number"
              step="0.01"
              min="0"
              max="100"
              class="form-control erp-input"
            />
          </div>

          <div class="col-6 col-md-4">
            <label class="form-label text-black small fw-semibold">Alíquota ICMS Interestadual (%)</label>
            <input
              v-model.number="form.aliquota_icms_interestadual"
              type="number"
              step="0.01"
              min="0"
              max="100"
              class="form-control erp-input"
            />
          </div>

          <div class="col-6 col-md-4">
            <label class="form-label text-black small fw-semibold">FCP (%)</label>
            <input
              v-model.number="form.fcp_percentual"
              type="number"
              step="0.01"
              min="0"
              max="100"
              class="form-control erp-input"
            />
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">DIFAL Calculado (%)</label>
            <input
              :value="calculatedDifal.toFixed(2)"
              type="text"
              readonly
              class="form-control erp-input fw-bold"
            />
          </div>

          <div class="col-12 col-md-4">
            <div class="form-check form-switch erp-switch-box rounded p-2 ps-5">
              <input
                id="aplicaDifalCheck"
                v-model="form.aplica_difal"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label text-black small fw-semibold" for="aplicaDifalCheck">
                Aplica DIFAL na UF
              </label>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-check form-switch erp-switch-box rounded p-2 ps-5">
              <input
                id="suframaAreaCheck"
                v-model="form.suframa_area"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label text-black small fw-semibold" for="suframaAreaCheck">
                Área de Incentivo / SUFRAMA
              </label>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-check form-switch erp-switch-box rounded p-2 ps-5">
              <input
                id="estadoAtivoCheck"
                v-model="form.ativo"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label text-black small fw-semibold" for="estadoAtivoCheck">
                UF Ativa para Operações
              </label>
            </div>
          </div>
        </div>
      </form>

      <!-- Lista de Estados Cadastrados -->
      <div class="erp-card rounded-3 p-3 p-md-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
          <h2 class="h6 fw-bold text-black mb-0">
            <i class="bi bi-table me-2 text-black" aria-hidden="true"></i>
            Estados Cadastrados ({{ filteredStates.length }})
          </h2>
          <input
            v-model="searchUf"
            type="text"
            class="form-control erp-input w-auto"
            placeholder="Filtrar por UF ou nome..."
          />
        </div>

        <div v-if="isLoading" class="text-black small">Carregando estados...</div>

        <div v-else-if="filteredStates.length === 0" class="text-black small">
          Nenhum estado cadastrado ainda. Cadastre acima ou clique em "Carregar 27 UFs Padrão".
        </div>

        <div v-else class="table-responsive">
          <table class="table table-light table-hover align-middle mb-0 small text-black">
            <thead>
              <tr>
                <th>UF</th>
                <th>Estado</th>
                <th>IBGE</th>
                <th>ICMS Interno</th>
                <th>ICMS Interestadual</th>
                <th>FCP</th>
                <th>DIFAL</th>
                <th>SUFRAMA</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredStates" :key="item.id || item.uf">
                <td class="fw-bold">{{ item.uf }}</td>
                <td>{{ item.nome }}</td>
                <td>{{ item.codigo_ibge_uf || "-" }}</td>
                <td>{{ Number(item.aliquota_icms_interna ?? 0).toFixed(2) }}%</td>
                <td>{{ Number(item.aliquota_icms_interestadual ?? 0).toFixed(2) }}%</td>
                <td>{{ Number(item.fcp_percentual ?? 0).toFixed(2) }}%</td>
                <td class="fw-bold">{{ Number(item.aliquota_difal ?? 0).toFixed(2) }}%</td>
                <td>{{ item.suframa_area ? "Sim" : "Não" }}</td>
                <td>
                  <span class="badge" :class="item.ativo ? 'bg-dark text-white' : 'bg-secondary text-white'">
                    {{ item.ativo ? "Ativo" : "Inativo" }}
                  </span>
                </td>
                <td class="text-end">
                  <button
                    type="button"
                    class="btn btn-outline-dark btn-sm me-1"
                    @click="editState(item)"
                  >
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="deleteState(item)"
                  >
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStateRegistration } from "../composables/useStateRegistration";

const router = useRouter();

const {
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
} = useStateRegistration();

function goToHome() {
  router.push("/home");
}

onMounted(loadStates);
</script>

<style scoped>
.erp-state-module,
.erp-state-module * {
  color: #000000;
}

.erp-state-module {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.erp-card {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid rgba(0, 0, 0, 0.16);
  transition: border-color 0.2s ease;
}

.erp-card:hover {
  border-color: #000000;
}

.erp-input {
  background-color: #ffffff !important;
  color: #000000 !important;
  border-color: rgba(0, 0, 0, 0.28);
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.erp-input:hover,
.erp-input:focus {
  background-color: #f8f9fa !important;
  color: #000000 !important;
  border-color: #000000;
  box-shadow: 0 0 0 0.15rem rgba(0, 0, 0, 0.12);
}

.erp-input::placeholder {
  color: rgba(0, 0, 0, 0.5) !important;
}

.erp-switch-box {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid rgba(0, 0, 0, 0.22);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.erp-switch-box:hover {
  border-color: #000000;
  background-color: #f8f9fa !important;
}

.btn-dark,
.btn-dark * {
  color: #ffffff !important;
}

.erp-hover-btn {
  transition: transform 0.15s ease, filter 0.15s ease;
}

.erp-hover-btn:hover {
  transform: translateY(-1px);
  filter: brightness(0.96);
}
</style>