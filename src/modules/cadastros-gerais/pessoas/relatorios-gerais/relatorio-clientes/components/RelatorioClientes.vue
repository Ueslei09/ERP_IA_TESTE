<template>
  <section class="p-3 p-md-4 relatorio-clientes-view">
    <div class="text-muted small mb-1">
      Cadastros Gerais • Pessoas • Relatórios • Relatório de Clientes
    </div>

    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3"
    >
      <div>
        <h2 class="h4 fw-bold mb-1">Relatório de Clientes</h2>
        <p class="text-muted small mb-0">
          Consulta gerencial de clientes por perfil, tipo de operação, status e exportação CSV.
        </p>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm flex-fill flex-md-grow-0"
          @click="voltarParaHome"
        >
          ← Voltar ao Home
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm flex-fill flex-md-grow-0"
          @click="limparFiltros"
          :disabled="carregando"
        >
          Limpar Filtros
        </button>
        <button
          type="button"
          class="btn btn-outline-dark btn-sm flex-fill flex-md-grow-0"
          @click="exportarCsv"
          :disabled="carregando || clientes.length === 0"
        >
          Exportar CSV
        </button>
        <button
          type="button"
          class="btn btn-dark btn-sm flex-fill flex-md-grow-0"
          @click="carregarRelatorio"
          :disabled="carregando"
        >
          {{ carregando ? "Atualizando..." : "Filtrar" }}
        </button>
      </div>
    </div>

    <div v-if="mensagemErro" class="alert alert-danger py-2 small" role="alert">
      {{ mensagemErro }}
    </div>

    <!-- Cards de Resumo -->
    <div class="row g-3 mb-3 mb-md-4">
      <div class="col-6 col-lg-3">
        <div class="card border rounded-3 h-100">
          <div class="card-body p-3">
            <div class="text-muted small">Total de Clientes</div>
            <div class="h5 fw-bold mb-0 mt-1">{{ resumo.total }}</div>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border rounded-3 h-100">
          <div class="card-body p-3">
            <div class="text-muted small">Ativos / Inativos</div>
            <div class="h5 fw-bold mb-0 mt-1">
              {{ resumo.ativos }} <span class="text-muted fs-6 fw-normal">/ {{ resumo.inativos }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border rounded-3 h-100">
          <div class="card-body p-3">
            <div class="text-muted small">Limite de Crédito Total</div>
            <div class="h5 fw-bold mb-0 mt-1">{{ formatarMoeda(resumo.limiteCreditoTotal) }}</div>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border rounded-3 h-100">
          <div class="card-body p-3">
            <div class="text-muted small">Saldo Disponível Total</div>
            <div class="h5 fw-bold mb-0 mt-1">{{ formatarMoeda(resumo.saldoDisponivelTotal) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card border rounded-3 mb-3 mb-md-4">
      <div class="card-body p-3 p-md-4">
        <div class="row g-3">
          <div class="col-12 col-md-6 col-lg-4">
            <label for="relBusca" class="form-label small fw-medium">Busca</label>
            <input
              id="relBusca"
              v-model="filtros.busca"
              type="text"
              class="form-control form-control-sm"
              placeholder="Nome, CPF/CNPJ, e-mail ou telefone..."
              @keyup.enter="carregarRelatorio"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <label for="relPerfil" class="form-label small fw-medium">Perfil do Cliente</label>
            <select
              id="relPerfil"
              v-model="filtros.perfil_cliente"
              class="form-select form-select-sm"
              @change="carregarRelatorio"
            >
              <option value="TODOS">Todos os perfis</option>
              <option
                v-for="perfil in perfisCliente"
                :key="perfil.id || perfil.codigo"
                :value="perfil.codigo"
              >
                {{ perfil.codigo }} - {{ perfil.descricao }}
              </option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <label for="relOperacao" class="form-label small fw-medium">Tipo de Operação</label>
            <select
              id="relOperacao"
              v-model="filtros.tipo_operacao"
              class="form-select form-select-sm"
              @change="carregarRelatorio"
            >
              <option value="TODOS">Todas as operações</option>
              <option
                v-for="op in tiposOperacao"
                :key="op.id || op.codigo"
                :value="op.codigo"
              >
                {{ op.codigo }} - {{ op.descricao }}
              </option>
            </select>
          </div>

          <div class="col-12 col-lg-2">
            <label for="relStatus" class="form-label small fw-medium">Status</label>
            <select
              id="relStatus"
              v-model="filtros.ativo"
              class="form-select form-select-sm"
              @change="carregarRelatorio"
            >
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="card border rounded-3">
      <div class="card-body p-3 p-md-4">
        <div v-if="carregando" class="text-muted small py-3">
          Carregando relatório...
        </div>

        <div v-else-if="clientes.length === 0" class="text-muted small py-3">
          Nenhum cliente encontrado para os filtros selecionados.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr class="small text-muted">
                <th>CPF/CNPJ</th>
                <th>Nome / Razão Social</th>
                <th class="d-none d-md-table-cell">Perfil</th>
                <th class="d-none d-lg-table-cell">Operação</th>
                <th class="d-none d-md-table-cell">Telefone / E-mail</th>
                <th class="d-none d-lg-table-cell text-end">Limite Crédito</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in clientes" :key="row.id">
                <td class="fw-semibold text-nowrap">{{ row.cpf_cnpj }}</td>
                <td>{{ row.nome_razao_social || row.nome_completo }}</td>
                <td class="d-none d-md-table-cell">
                  <span class="badge bg-light text-dark border">
                    {{ row.perfil_cliente || "PADRAO" }}
                  </span>
                </td>
                <td class="d-none d-lg-table-cell">
                  <span class="badge bg-light text-dark border">
                    {{ row.tipo_operacao || "a_vista" }}
                  </span>
                </td>
                <td class="d-none d-md-table-cell small">
                  <div>{{ row.telefone || "-" }}</div>
                  <div class="text-muted">{{ row.email || "-" }}</div>
                </td>
                <td class="d-none d-lg-table-cell text-end text-nowrap">
                  {{ formatarMoeda(row.limite_credito) }}
                </td>
                <td>
                  <span
                    class="badge"
                    :class="
                      row.ativo
                        ? 'bg-success-subtle text-success'
                        : 'bg-secondary-subtle text-secondary'
                    "
                  >
                    {{ row.ativo ? "Ativo" : "Inativo" }}
                  </span>
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
import { useRelatorioClientes } from "../composables/useRelatorioClientes.js";

const router = useRouter();

const {
  clientes,
  perfisCliente,
  tiposOperacao,
  filtros,
  resumo,
  carregando,
  mensagemErro,
  limparFiltros,
  carregarFiltrosAuxiliares,
  carregarRelatorio,
  exportarCsv,
} = useRelatorioClientes();

function voltarParaHome() {
  router.push({ name: "home" });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

onMounted(async () => {
  await carregarFiltrosAuxiliares();
  await carregarRelatorio();
});
</script>

<style scoped>
.relatorio-clientes-view {
  background-color: #f8fafc;
  min-height: 100%;
  overflow-x: hidden;
}

.relatorio-clientes-view .card {
  border-color: rgba(15, 23, 42, 0.1) !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.relatorio-clientes-view .form-control:focus,
.relatorio-clientes-view .form-select:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 0.15rem rgba(15, 23, 42, 0.12);
}

.relatorio-clientes-view .table th {
  white-space: nowrap;
  font-weight: 600;
}

.relatorio-clientes-view .table td {
  vertical-align: middle;
}
</style>