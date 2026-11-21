<!-- src/modules/cities/components/CityRegistrationPanel.vue -->
<template>
  <section class="erp-city-module py-4 py-md-5 min-vh-100">
    <div class="container-fluid px-3 px-lg-4">
      <!-- Cabeçalho -->
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
        <div>
          <span class="badge bg-white border border-black text-black mb-2">
            <i class="bi bi-folder2-open me-1" aria-hidden="true"></i>
            Operações • Cadastros Gerais • Controles • Cadastro de Cidades
          </span>
          <h1 class="h4 fw-bold text-black mb-1">
            <i class="bi bi-building me-2 text-black" aria-hidden="true"></i>
            Cadastro de Cidades (Municípios / IBGE)
          </h1>
          <p class="text-black small mb-0">
            Municípios vinculados à UF e código IBGE de 7 dígitos para endereços e emissão de NF-e.
          </p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-outline-dark btn-sm erp-hover-btn" @click="goToHome">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Voltar ao Home
          </button>
          <button type="button" class="btn btn-outline-dark btn-sm erp-hover-btn" @click="resetForm">
            <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
            Limpar
          </button>
          <button
            type="button"
            class="btn btn-dark text-white fw-semibold btn-sm erp-hover-btn"
            :disabled="isSaving"
            @click="submitCity"
          >
            <i class="bi bi-check2-circle me-1" aria-hidden="true"></i>
            {{ isSaving ? "Salvando..." : "Salvar Cidade" }}
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

      <!-- Formulário de Cidade -->
      <form class="erp-card rounded-3 p-3 p-md-4 mb-4" @submit.prevent="submitCity">
        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-geo-alt me-2 text-black" aria-hidden="true"></i>
          Dados do Município
        </h2>

        <div class="row g-3">
          <div class="col-6 col-md-3">
            <label class="form-label text-black small fw-semibold">UF *</label>
            <select
              v-if="availableStates.length > 0"
              v-model="form.uf"
              class="form-select erp-input text-uppercase"
              @change="onSelectUf"
            >
              <option value="">Selecione...</option>
              <option v-for="st in availableStates" :key="st.uf" :value="st.uf">
                {{ st.uf }} - {{ st.nome }}
              </option>
            </select>
            <input
              v-else
              v-model="form.uf"
              type="text"
              maxlength="2"
              class="form-control erp-input text-uppercase"
              placeholder="GO"
              @input="onSelectUf"
            />
          </div>

          <div class="col-6 col-md-5">
            <label class="form-label text-black small fw-semibold">Nome da Cidade *</label>
            <input
              v-model="form.nome"
              type="text"
              class="form-control erp-input"
              placeholder="Goiânia"
            />
          </div>

          <div class="col-6 col-md-2">
            <label class="form-label text-black small fw-semibold">Código IBGE (7 dígitos) *</label>
            <input
              v-model="form.codigo_ibge"
              type="text"
              maxlength="7"
              class="form-control erp-input"
              placeholder="5208707"
            />
          </div>

          <div class="col-6 col-md-2">
            <label class="form-label text-black small fw-semibold">CEP Padrão</label>
            <input
              v-model="form.cep_padrao"
              type="text"
              maxlength="9"
              class="form-control erp-input"
              placeholder="74000000"
            />
          </div>

          <div class="col-12 col-md-4">
            <div class="form-check form-switch erp-switch-box rounded p-2 ps-5">
              <input
                id="cidadeAtivaCheck"
                v-model="form.ativo"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label text-black small fw-semibold" for="cidadeAtivaCheck">
                Cidade Ativa para Operações
              </label>
            </div>
          </div>
        </div>
      </form>

      <!-- Lista de Cidades Cadastradas -->
      <div class="erp-card rounded-3 p-3 p-md-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
          <h2 class="h6 fw-bold text-black mb-0">
            <i class="bi bi-table me-2 text-black" aria-hidden="true"></i>
            Cidades Cadastradas ({{ filteredCities.length }})
          </h2>

          <div class="d-flex flex-wrap gap-2">
            <input
              v-model="filterUf"
              type="text"
              maxlength="2"
              class="form-control erp-input text-uppercase"
              style="width: 90px"
              placeholder="UF"
            />
            <input
              v-model="searchQuery"
              type="text"
              class="form-control erp-input w-auto"
              placeholder="Buscar cidade ou IBGE..."
            />
          </div>
        </div>

        <div v-if="isLoading" class="text-black small">Carregando cidades...</div>

        <div v-else-if="filteredCities.length === 0" class="text-black small">
          Nenhuma cidade cadastrada ainda. Preencha o formulário acima e clique em "Salvar Cidade".
        </div>

        <div v-else class="table-responsive">
          <table class="table table-light table-hover align-middle mb-0 small text-black">
            <thead>
              <tr>
                <th>UF</th>
                <th>Cidade</th>
                <th>Código IBGE</th>
                <th>CEP Padrão</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredCities" :key="item.id || item.codigo_ibge">
                <td class="fw-bold">{{ item.uf }}</td>
                <td>{{ item.nome }}</td>
                <td>{{ item.codigo_ibge }}</td>
                <td>{{ item.cep_padrao || "-" }}</td>
                <td>
                  <span class="badge" :class="item.ativo ? 'bg-dark text-white' : 'bg-secondary text-white'">
                    {{ item.ativo ? "Ativa" : "Inativa" }}
                  </span>
                </td>
                <td class="text-end">
                  <button
                    type="button"
                    class="btn btn-outline-dark btn-sm me-1"
                    @click="editCity(item)"
                  >
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="deleteCity(item)"
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
import { useCityRegistration } from "../composables/useCityRegistration";

const router = useRouter();

const {
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
} = useCityRegistration();

function goToHome() {
  router.push("/home");
}

onMounted(loadCitiesAndStates);
</script>

<style scoped>
.erp-city-module,
.erp-city-module * {
  color: #000000;
}

.erp-city-module {
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