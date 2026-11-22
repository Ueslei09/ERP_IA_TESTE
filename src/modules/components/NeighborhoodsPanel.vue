<template>
  <section class="p-4">
    <div class="text-muted small mb-1">
      Cadastros Gerais • Controles • Cadastro de Bairros
    </div>

    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h2 class="h4 fw-bold mb-1">Cadastro de Bairros</h2>
        <p class="text-muted small mb-0">
          Bairros vinculados à UF e ao município para endereços, entregas e cadastros.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="resetForm"
          :disabled="saving"
        >
          Limpar
        </button>
        <button
          type="button"
          class="btn btn-dark btn-sm"
          @click="saveNeighborhood"
          :disabled="saving"
        >
          {{ saving ? "Salvando..." : "Salvar Bairro" }}
        </button>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger py-2 small" role="alert">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="alert alert-success py-2 small" role="alert">
      {{ successMessage }}
    </div>

    <div class="card border rounded-3 mb-4">
      <div class="card-body">
        <h3 class="h6 fw-semibold mb-3">Dados do Bairro</h3>

        <div class="row g-3">
          <div class="col-12 col-md-2">
            <label class="form-label small fw-medium">UF *</label>
            <select v-model="form.uf" class="form-select form-select-sm">
              <option value="AC">AC - ACRE</option>
              <option value="AL">AL - ALAGOAS</option>
              <option value="AP">AP - AMAPÁ</option>
              <option value="AM">AM - AMAZONAS</option>
              <option value="BA">BA - BAHIA</option>
              <option value="CE">CE - CEARÁ</option>
              <option value="DF">DF - DISTRITO FEDERAL</option>
              <option value="ES">ES - ESPÍRITO SANTO</option>
              <option value="GO">GO - GOIÁS</option>
              <option value="MA">MA - MARANHÃO</option>
              <option value="MT">MT - MATO GROSSO</option>
              <option value="MS">MS - MATO GROSSO DO SUL</option>
              <option value="MG">MG - MINAS GERAIS</option>
              <option value="PA">PA - PARÁ</option>
              <option value="PB">PB - PARAÍBA</option>
              <option value="PR">PR - PARANÁ</option>
              <option value="PE">PE - PERNAMBUCO</option>
              <option value="PI">PI - PIAUÍ</option>
              <option value="RJ">RJ - RIO DE JANEIRO</option>
              <option value="RN">RN - RIO GRANDE DO NORTE</option>
              <option value="RS">RS - RIO GRANDE DO SUL</option>
              <option value="RO">RO - RONDÔNIA</option>
              <option value="RR">RR - RORAIMA</option>
              <option value="SC">SC - SANTA CATARINA</option>
              <option value="SP">SP - SÃO PAULO</option>
              <option value="SE">SE - SERGIPE</option>
              <option value="TO">TO - TOCANTINS</option>
            </select>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label small fw-medium">Cidade</label>
            <select
              v-if="cities.length > 0"
              :value="form.cidade_id || ''"
              class="form-select form-select-sm"
              @change="onSelectCity($event.target.value)"
            >
              <option value="">Selecione ou digite abaixo...</option>
              <option v-for="city in cities" :key="city.id" :value="city.id">
                {{ city.nome }} ({{ city.uf }})
              </option>
            </select>
            <input
              v-else
              v-model="form.cidade_nome"
              type="text"
              class="form-control form-control-sm"
              placeholder="Ex.: GOIANIA"
            />
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label small fw-medium">Nome do Bairro *</label>
            <input
              v-model="form.nome"
              type="text"
              class="form-control form-control-sm"
              placeholder="Ex.: SETOR BUENO"
            />
          </div>

          <div class="col-12 col-md-2">
            <label class="form-label small fw-medium">CEP Padrão</label>
            <input
              v-model="form.cep_padrao"
              type="text"
              maxlength="8"
              class="form-control form-control-sm"
              placeholder="74210010"
              @input="form.cep_padrao = form.cep_padrao.replace(/\D/g, '').slice(0, 8)"
            />
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label small fw-medium">Zona / Região</label>
            <input
              v-model="form.zona"
              type="text"
              class="form-control form-control-sm"
              placeholder="Ex.: Sul, Central, Norte"
            />
          </div>

          <div class="col-12 col-md-4 d-flex align-items-end">
            <div class="form-check form-switch">
              <input
                id="bairroAtivo"
                v-model="form.ativo"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label small" for="bairroAtivo">
                Bairro Ativo para Operações
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border rounded-3">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 class="h6 fw-semibold mb-0">
            Bairros Cadastrados ({{ filteredItems.length }})
          </h3>

          <div class="d-flex gap-2">
            <input
              v-model="filterUf"
              type="text"
              maxlength="2"
              class="form-control form-control-sm"
              style="width: 75px"
              placeholder="UF"
              @input="filterUf = filterUf.toUpperCase()"
            />
            <input
              v-model="searchQuery"
              type="text"
              class="form-control form-control-sm"
              style="width: 220px"
              placeholder="Buscar bairro ou cidade..."
            />
          </div>
        </div>

        <div v-if="loading" class="text-muted small py-3">Carregando bairros...</div>

        <div
          v-else-if="filteredItems.length === 0"
          class="text-muted small py-3"
        >
          Nenhum bairro cadastrado ainda. Preencha o formulário acima e clique em "Salvar Bairro".
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr class="small text-muted">
                <th>UF</th>
                <th>Cidade</th>
                <th>Bairro</th>
                <th>CEP Padrão</th>
                <th>Zona</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredItems" :key="row.id">
                <td>{{ row.uf }}</td>
                <td>{{ row.cidade_nome || "-" }}</td>
                <td class="fw-medium">{{ row.nome }}</td>
                <td>{{ row.cep_padrao || "-" }}</td>
                <td>{{ row.zona || "-" }}</td>
                <td>
                  <span
                    class="badge"
                    :class="row.ativo ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'"
                  >
                    {{ row.ativo ? "Ativo" : "Inativo" }}
                  </span>
                </td>
                <td class="text-end">
                  <button
                    type="button"
                    class="btn btn-outline-primary btn-sm me-1"
                    @click="editNeighborhood(row)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="deleteNeighborhood(row.id)"
                  >
                    Excluir
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
import { useNeighborhoods } from "../composables/useNeighborhoods.js";

const {
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
} = useNeighborhoods();

onMounted(() => {
  fetchNeighborhoods();
});
</script>