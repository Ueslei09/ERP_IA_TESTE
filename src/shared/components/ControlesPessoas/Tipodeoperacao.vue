<!-- src/shared/components/cadastroPessoas/Tipodeoperacao.vue -->
<template>
  <section class="p-3 p-md-4 tipo-operacao-form">
    <div class="text-muted small mb-1">
      Cadastros Gerais • Controles • Cadastro de Tipo de Operação
    </div>

    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3"
    >
      <div>
        <h2 class="h4 fw-bold mb-1">Cadastro de Tipo de Operação</h2>
        <p class="text-muted small mb-0">
          Defina os tipos de operação disponíveis para vínculo e uso no cadastro de clientes.
        </p>
      </div>

      <div class="d-flex flex-wrap gap-2 acoes-topo">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm flex-fill flex-md-grow-0"
          @click="voltarParaHome"
          :disabled="salvando"
        >
          ← Voltar ao Home
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm flex-fill flex-md-grow-0"
          @click="limparFormulario"
          :disabled="salvando"
        >
          Limpar
        </button>
        <button
          type="button"
          class="btn btn-dark btn-sm flex-fill flex-md-grow-0"
          @click="salvarTipoOperacao"
          :disabled="salvando"
        >
          {{ salvando ? "Salvando..." : "Salvar Tipo de Operação" }}
        </button>
      </div>
    </div>

    <div v-if="mensagemErro" class="alert alert-danger py-2 small" role="alert">
      {{ mensagemErro }}
    </div>
    <div v-if="mensagemSucesso" class="alert alert-success py-2 small" role="alert">
      {{ mensagemSucesso }}
    </div>

    <div class="card border rounded-3 mb-3 mb-md-4">
      <div class="card-body p-3 p-md-4">
        <div class="row g-3">
          <div class="col-12 col-sm-5 col-lg-3">
            <label for="opCodigo" class="form-label small fw-medium">Código *</label>
            <input
              id="opCodigo"
              v-model="formulario.codigo"
              type="text"
              maxlength="30"
              class="form-control form-control-sm"
              placeholder="EX.: VENDA"
              @input="formatarCodigo"
            />
          </div>

          <div class="col-12 col-sm-7 col-lg-6">
            <label for="opDescricao" class="form-label small fw-medium">Descrição *</label>
            <input
              id="opDescricao"
              v-model="formulario.descricao"
              type="text"
              maxlength="100"
              class="form-control form-control-sm"
              placeholder="Ex.: Venda, Orçamento, Devolução"
            />
          </div>

          <div class="col-12 col-lg-3 d-flex align-items-lg-end">
            <div class="form-check form-switch">
              <input
                id="opAtivo"
                v-model="formulario.ativo"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label small" for="opAtivo">
                Operação Ativa
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border rounded-3">
      <div class="card-body p-3 p-md-4">
        <div
          class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3"
        >
          <h3 class="h6 fw-semibold mb-0">
            Tipos de Operação Cadastrados ({{ tiposOperacaoFiltrados.length }})
          </h3>

          <input
            v-model="buscaTexto"
            type="text"
            class="form-control form-control-sm busca-operacao-input"
            placeholder="Buscar tipo de operação..."
            aria-label="Buscar tipo de operação"
          />
        </div>

        <div v-if="carregando" class="text-muted small py-3">
          Carregando tipos de operação...
        </div>

        <div
          v-else-if="tiposOperacaoFiltrados.length === 0"
          class="text-muted small py-3"
        >
          Nenhum tipo de operação cadastrado.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr class="small text-muted">
                <th>Código</th>
                <th>Descrição</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in tiposOperacaoFiltrados"
                :key="row.id || row.codigo"
              >
                <td class="fw-semibold text-nowrap">{{ row.codigo }}</td>
                <td>{{ row.descricao }}</td>
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
                <td class="text-end text-nowrap" v-if="row.id">
                  <button
                    type="button"
                    class="btn btn-outline-primary btn-sm me-1"
                    @click="editarTipoOperacao(row)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="excluirTipoOperacao(row.id)"
                  >
                    Excluir
                  </button>
                </td>
                <td class="text-end text-muted small" v-else>Padrão</td>
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
import { useCadastroTipoOperacao } from "@/shared/composables/useCadastroTipoOperacao.js";

const router = useRouter();

const {
  tiposOperacaoFiltrados,
  formulario,
  carregando,
  salvando,
  mensagemErro,
  mensagemSucesso,
  buscaTexto,
  limparFormulario,
  formatarCodigo,
  editarTipoOperacao,
  carregarTiposOperacao,
  salvarTipoOperacao,
  excluirTipoOperacao,
} = useCadastroTipoOperacao();

function voltarParaHome() {
  router.push({ name: "home" });
}

onMounted(() => {
  carregarTiposOperacao();
});
</script>

<style scoped>
.tipo-operacao-form {
  background-color: #f8fafc;
  min-height: 100%;
  overflow-x: hidden;
}

.tipo-operacao-form .card {
  border-color: rgba(15, 23, 42, 0.1) !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.tipo-operacao-form .form-label {
  color: #334155;
}

.tipo-operacao-form .form-control:focus,
.tipo-operacao-form .form-select:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 0.15rem rgba(15, 23, 42, 0.12);
}

.tipo-operacao-form .busca-operacao-input {
  width: 260px;
  max-width: 100%;
}

@media (max-width: 575.98px) {
  .tipo-operacao-form .busca-operacao-input {
    width: 100%;
  }

  .tipo-operacao-form .table .btn {
    padding: 0.2rem 0.45rem;
    font-size: 0.75rem;
  }
}

.tipo-operacao-form .table th {
  white-space: nowrap;
  font-weight: 600;
}

.tipo-operacao-form .table td {
  vertical-align: middle;
}
</style>