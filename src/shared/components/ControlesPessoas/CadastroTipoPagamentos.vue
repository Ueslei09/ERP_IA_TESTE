<!-- src/compartilhado/componentes/CadastroTipoPagamento.vue -->
<template>
  <section class="p-4">
    <div class="text-muted small mb-1">
      Cadastros Gerais • Controles • Cadastro de Tipos de Pagamento
    </div>

    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h2 class="h4 fw-bold mb-1">Cadastro de Tipos de Pagamento</h2>
        <p class="text-muted small mb-0">
          Numeração e sequência personalizadas para vendas, negociação com clientes, contas a receber e baixa de duplicatas.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="voltarParaHome"
          :disabled="salvando"
        >
          ← Voltar ao Home
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="limparFormulario"
          :disabled="salvando"
        >
          Limpar
        </button>
        <button
          type="button"
          class="btn btn-dark btn-sm"
          @click="salvarTipoPagamento"
          :disabled="salvando"
        >
          {{ salvando ? "Salvando..." : "Salvar Tipo de Pagamento" }}
        </button>
      </div>
    </div>

    <div v-if="mensagemErro" class="alert alert-danger py-2 small" role="alert">
      {{ mensagemErro }}
    </div>
    <div v-if="mensagemSucesso" class="alert alert-success py-2 small" role="alert">
      {{ mensagemSucesso }}
    </div>

    <div class="card border rounded-3 mb-4">
      <div class="card-body">
        <h3 class="h6 fw-semibold mb-3">Dados e Regras do Tipo de Pagamento</h3>

        <div class="row g-3">
          <div class="col-12 col-md-2">
            <label class="form-label small fw-medium">Numeração / Código *</label>
            <input
              v-model="formulario.codigo"
              type="text"
              maxlength="20"
              class="form-control form-control-sm"
              placeholder="Ex.: 01 ou 100"
            />
          </div>

          <div class="col-12 col-md-2">
            <label class="form-label small fw-medium">Ordem Exibição *</label>
            <input
              v-model.number="formulario.ordem_exibicao"
              type="number"
              min="1"
              class="form-control form-control-sm"
            />
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label small fw-medium">Descrição *</label>
            <input
              v-model="formulario.descricao"
              type="text"
              maxlength="100"
              class="form-control form-control-sm"
              placeholder="Ex.: DINHEIRO À VISTA, PIX, A PRAZO 30D"
            />
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label small fw-medium">Natureza / Comportamento *</label>
            <select
              v-model="formulario.natureza"
              class="form-select form-select-sm"
              @change="aplicarPredefinicaoNatureza"
            >
              <option value="DINHEIRO">Somente Dinheiro (À Vista)</option>
              <option value="PIX">PIX (À Vista)</option>
              <option value="DEBITO">Cartão de Débito (À Vista)</option>
              <option value="CREDITO_AVISTA">Cartão de Crédito (À Vista)</option>
              <option value="CREDITO_PARCELADO">Cartão de Crédito Parcelado</option>
              <option value="A_PRAZO">A Prazo / Duplicata / Crediário</option>
              <option value="OUTRO">Outro / Personalizado</option>
            </select>
          </div>

          <div class="col-12 col-md-2">
            <label class="form-label small fw-medium">Máx. Parcelas</label>
            <input
              v-model.number="formulario.max_parcelas"
              type="number"
              min="1"
              class="form-control form-control-sm"
              :disabled="!formulario.permite_parcelamento || formulario.natureza === 'DINHEIRO'"
            />
          </div>

          <div class="col-12 col-md-2">
            <label class="form-label small fw-medium">Intervalo (Dias)</label>
            <input
              v-model.number="formulario.intervalo_dias"
              type="number"
              min="0"
              class="form-control form-control-sm"
              :disabled="!formulario.permite_parcelamento || formulario.natureza === 'DINHEIRO'"
            />
          </div>

          <div class="col-12 col-md-8 d-flex flex-wrap align-items-end gap-4">
            <div class="form-check form-switch">
              <input
                id="tpAVista"
                v-model="formulario.somente_a_vista"
                class="form-check-input"
                type="checkbox"
                :disabled="formulario.natureza === 'DINHEIRO'"
              />
              <label class="form-check-label small" for="tpAVista">
                Modalidade À Vista
              </label>
            </div>

            <div class="form-check form-switch">
              <input
                id="tpParcela"
                v-model="formulario.permite_parcelamento"
                class="form-check-input"
                type="checkbox"
                :disabled="formulario.natureza === 'DINHEIRO'"
              />
              <label class="form-check-label small" for="tpParcela">
                Permite Parcelamento
              </label>
            </div>

            <div class="form-check form-switch">
              <input
                id="tpDuplicata"
                v-model="formulario.gera_duplicata"
                class="form-check-input"
                type="checkbox"
                :disabled="formulario.natureza === 'DINHEIRO'"
              />
              <label class="form-check-label small" for="tpDuplicata">
                Gera Contas a Receber / Duplicata
              </label>
            </div>

            <div class="form-check form-switch">
              <input
                id="tpBaixa"
                v-model="formulario.exige_baixa"
                class="form-check-input"
                type="checkbox"
                :disabled="formulario.natureza === 'DINHEIRO'"
              />
              <label class="form-check-label small" for="tpBaixa">
                Exige Baixa de Duplicata
              </label>
            </div>

            <div class="form-check form-switch">
              <input
                id="tpAtivo"
                v-model="formulario.ativo"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label small" for="tpAtivo">
                Ativo
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
            Tipos de Pagamento Cadastrados ({{ itensFiltrados.length }})
          </h3>

          <input
            v-model="buscaTexto"
            type="text"
            class="form-control form-control-sm"
            style="width: 260px"
            placeholder="Buscar por código, descrição ou natureza..."
          />
        </div>

        <div v-if="carregando" class="text-muted small py-3">
          Carregando tipos de pagamento...
        </div>

        <div v-else-if="itensFiltrados.length === 0" class="text-muted small py-3">
          Nenhum tipo de pagamento cadastrado. Defina a numeração e clique em "Salvar Tipo de Pagamento".
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr class="small text-muted">
                <th>Ordem</th>
                <th>Código</th>
                <th>Descrição</th>
                <th>Natureza</th>
                <th>Parcelas</th>
                <th>Financeiro</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in itensFiltrados" :key="row.id">
                <td>{{ row.ordem_exibicao }}</td>
                <td class="fw-semibold">{{ row.codigo }}</td>
                <td>{{ row.descricao }}</td>
                <td><span class="badge bg-light text-dark border">{{ row.natureza }}</span></td>
                <td>
                  {{ row.permite_parcelamento ? `Até ${row.max_parcelas}x (${row.intervalo_dias}d)` : "À vista (1x)" }}
                </td>
                <td class="small">
                  <span v-if="row.gera_duplicata" class="badge bg-info-subtle text-info me-1">
                    Gera Duplicata
                  </span>
                  <span v-if="row.exige_baixa" class="badge bg-warning-subtle text-warning">
                    Exige Baixa
                  </span>
                  <span v-if="!row.gera_duplicata && !row.exige_baixa" class="text-muted">
                    Liquidação direta
                  </span>
                </td>
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
                    @click="editarTipoPagamento(row)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="excluirTipoPagamento(row.id)"
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
import { useRouter } from "vue-router";
import { useTipoPagamento } from "@/shared/composables/UseControlesPessoas/useTipoPagamentos";

const router = useRouter();

const {
  itensFiltrados,
  formulario,
  carregando,
  salvando,
  mensagemErro,
  mensagemSucesso,
  buscaTexto,
  limparFormulario,
  aplicarPredefinicaoNatureza,
  editarTipoPagamento,
  carregarTiposPagamento,
  salvarTipoPagamento,
  excluirTipoPagamento,
} = useTipoPagamento();

function voltarParaHome() {
  router.push({ name: "home" });
}

onMounted(() => {
  carregarTiposPagamento();
});
</script>