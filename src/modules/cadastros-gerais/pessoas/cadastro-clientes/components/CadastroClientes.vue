<!-- src/modules/cadastros-gerais/pessoas/cadastro-clientes/components/CadastroClientes.vue -->
<template>
  <section class="p-3 p-md-4 cadastro-clientes-form">
    <div class="text-muted small mb-1">
      Cadastros Gerais • Pessoas • Cadastro de Clientes
    </div>

    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
      <div>
        <h2 class="h4 fw-bold mb-1">Cadastro de Clientes</h2>
        <p class="text-muted small mb-0">
          Cadastro completo de cliente, endereço IBGE e condições de pagamento para uso na venda/nota.
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
          @click="salvarCliente"
          :disabled="salvando"
        >
          {{ salvando ? "Salvando..." : "Salvar Cliente" }}
        </button>
      </div>
    </div>

    <div v-if="mensagemErro" class="alert alert-danger py-2 small" role="alert">
      {{ mensagemErro }}
    </div>
    <div v-if="mensagemSucesso" class="alert alert-success py-2 small" role="alert">
      {{ mensagemSucesso }}
    </div>

    <!-- Identificação e Dados Fiscais do Cliente -->
    <div class="card border rounded-3 mb-3 mb-md-4">
      <div class="card-body p-3 p-md-4">
        <h3 class="h6 fw-semibold mb-3">Identificação e Dados Fiscais do Cliente</h3>

        <div class="row g-3">
          <div class="col-12 col-sm-6 col-lg-2">
            <label for="cliTipoPessoa" class="form-label small fw-medium">Tipo Pessoa *</label>
            <select
              id="cliTipoPessoa"
              v-model="formulario.tipo_pessoa"
              class="form-select form-select-sm"
              @change="aoAlterarTipoPessoa"
            >
              <option value="PJ">PJ - Pessoa Jurídica</option>
              <option value="PF">PF - Pessoa Física</option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <label for="cliCpfCnpj" class="form-label small fw-medium">
              {{ formulario.tipo_pessoa === "PF" ? "CPF (11 dígitos) *" : "CNPJ (14 dígitos) *" }}
            </label>
            <input
              id="cliCpfCnpj"
              v-model="formulario.cpf_cnpj"
              type="text"
              inputmode="numeric"
              :maxlength="formulario.tipo_pessoa === 'PF' ? 11 : 14"
              class="form-control form-control-sm"
              :placeholder="formulario.tipo_pessoa === 'PF' ? '00000000000' : '00000000000000'"
              @input="formatarDocumento"
            />
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <label for="cliRazaoSocial" class="form-label small fw-medium">
              Nome / Razão Social *
            </label>
            <input
              id="cliRazaoSocial"
              v-model="formulario.nome_razao_social"
              type="text"
              maxlength="150"
              class="form-control form-control-sm"
              placeholder="Nome completo ou Razão Social"
            />
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <label for="cliNomeFantasia" class="form-label small fw-medium">Nome Fantasia</label>
            <input
              id="cliNomeFantasia"
              v-model="formulario.nome_fantasia"
              type="text"
              maxlength="150"
              class="form-control form-control-sm"
              placeholder="Nome fantasia"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <label for="cliPerfilCliente" class="form-label small fw-medium">
              Perfil do Cliente *
            </label>
            <select
              id="cliPerfilCliente"
              v-model="formulario.perfil_cliente"
              class="form-select form-select-sm"
            >
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
            <label for="cliTipoOperacao" class="form-label small fw-medium">
              Tipo de Operação *
            </label>
            <select
              id="cliTipoOperacao"
              v-model="formulario.tipo_operacao"
              class="form-select form-select-sm"
            >
              <option
                v-for="op in tiposOperacao"
                :key="op.id || op.codigo"
                :value="op.codigo"
              >
                {{ op.codigo }} - {{ op.descricao }}
              </option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <label for="cliIndIeDest" class="form-label small fw-medium">
              Indicador IE Destinatário (indIEDest) *
            </label>
            <select
              id="cliIndIeDest"
              :value="Number(formulario.indicador_ie_destinatario)"
              class="form-select form-select-sm"
              @change="aoAlterarIndicadorIe($event.target.value)"
            >
              <option :value="9">9 - Não contribuinte</option>
              <option :value="1">1 - Contribuinte ICMS</option>
              <option :value="2">2 - Contribuinte isento</option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <label for="cliIe" class="form-label small fw-medium">Inscrição Estadual</label>
            <input
              id="cliIe"
              v-model="formulario.inscricao_estadual"
              type="text"
              maxlength="20"
              class="form-control form-control-sm"
              :placeholder="Number(formulario.indicador_ie_destinatario) === 2 ? 'ISENTO' : 'Número ou ISENTO'"
              :disabled="Number(formulario.indicador_ie_destinatario) === 2"
              @input="formatarInscricaoEstadual"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-2">
            <label for="cliIm" class="form-label small fw-medium">Inscrição Municipal</label>
            <input
              id="cliIm"
              v-model="formulario.inscricao_municipal"
              type="text"
              maxlength="20"
              class="form-control form-control-sm"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <label for="cliTelefone" class="form-label small fw-medium">Telefone</label>
            <input
              id="cliTelefone"
              v-model="formulario.telefone"
              type="text"
              inputmode="numeric"
              maxlength="20"
              class="form-control form-control-sm"
              placeholder="62999999999"
              @input="formatarTelefone"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-4">
            <label for="cliEmail" class="form-label small fw-medium">E-mail (Nota / DANFE)</label>
            <input
              id="cliEmail"
              v-model="formulario.email"
              type="email"
              maxlength="150"
              class="form-control form-control-sm"
              placeholder="fiscal@cliente.com.br"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Endereço do Cliente -->
    <div class="card border rounded-3 mb-3 mb-md-4">
      <div class="card-body p-3 p-md-4">
        <h3 class="h6 fw-semibold mb-3">Endereço do Cliente</h3>

        <div class="row g-3">
          <div class="col-12 col-sm-6 col-lg-2">
            <label for="cliCep" class="form-label small fw-medium">CEP (8 dígitos)</label>
            <input
              id="cliCep"
              v-model="formulario.cep"
              type="text"
              inputmode="numeric"
              maxlength="8"
              class="form-control form-control-sm"
              placeholder="74000000"
              @input="formatarCep"
            />
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <label for="cliLogradouro" class="form-label small fw-medium">Logradouro</label>
            <input
              id="cliLogradouro"
              v-model="formulario.logradouro"
              type="text"
              maxlength="150"
              class="form-control form-control-sm"
              placeholder="Rua, Avenida, Alameda..."
            />
          </div>

          <div class="col-6 col-sm-3 col-lg-2">
            <label for="cliNumero" class="form-label small fw-medium">Número</label>
            <input
              id="cliNumero"
              v-model="formulario.numero"
              type="text"
              maxlength="20"
              class="form-control form-control-sm"
              placeholder="S/N"
            />
          </div>

          <div class="col-6 col-sm-3 col-lg-2">
            <label for="cliComplemento" class="form-label small fw-medium">Complemento</label>
            <input
              id="cliComplemento"
              v-model="formulario.complemento"
              type="text"
              maxlength="60"
              class="form-control form-control-sm"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-2">
            <label for="cliBairro" class="form-label small fw-medium">Bairro</label>
            <input
              id="cliBairro"
              v-model="formulario.bairro"
              type="text"
              maxlength="100"
              class="form-control form-control-sm"
            />
          </div>

          <div class="col-4 col-sm-2 col-lg-2">
            <label for="cliUf" class="form-label small fw-medium">UF</label>
            <input
              id="cliUf"
              v-model="formulario.uf"
              type="text"
              maxlength="2"
              class="form-control form-control-sm"
              placeholder="GO"
              @input="formatarUf"
            />
          </div>

          <div class="col-8 col-sm-6 col-lg-4">
            <label for="cliMunicipio" class="form-label small fw-medium">Município</label>
            <input
              id="cliMunicipio"
              v-model="formulario.nome_municipio"
              type="text"
              maxlength="100"
              class="form-control form-control-sm"
              placeholder="Ex.: GOIANIA"
            />
          </div>

          <div class="col-12 col-sm-4 col-lg-2">
            <label for="cliIbge" class="form-label small fw-medium">Cód. IBGE (7 dígitos)</label>
            <input
              id="cliIbge"
              v-model="formulario.codigo_ibge_municipio"
              type="text"
              inputmode="numeric"
              maxlength="7"
              class="form-control form-control-sm"
              placeholder="5208707"
              @input="formatarIbge"
            />
          </div>

          <div class="col-6 col-sm-6 col-lg-2">
            <label for="cliCodPais" class="form-label small fw-medium">Cód. País</label>
            <input
              id="cliCodPais"
              v-model="formulario.codigo_pais"
              type="text"
              maxlength="4"
              class="form-control form-control-sm"
            />
          </div>

          <div class="col-6 col-sm-6 col-lg-2">
            <label for="cliNomePais" class="form-label small fw-medium">País</label>
            <input
              id="cliNomePais"
              v-model="formulario.nome_pais"
              type="text"
              maxlength="60"
              class="form-control form-control-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Condições de Pagamento / Negociação -->
    <div class="card border rounded-3 mb-3 mb-md-4">
      <div class="card-body p-3 p-md-4">
        <h3 class="h6 fw-semibold mb-3">Política de Pagamento na Negociação</h3>

        <div class="row g-3">
          <div class="col-12 col-md-6 col-lg-4">
            <label for="cliPoliticaPagto" class="form-label small fw-medium">
              Política Permitida para o Cliente
            </label>
            <select
              id="cliPoliticaPagto"
              v-model="formulario.politica_pagamento"
              class="form-select form-select-sm"
              @change="aoAlterarPoliticaPagamento"
            >
              <option value="TODOS">Todos os tipos de pagamento do tenant</option>
              <option value="SOMENTE_DINHEIRO">Somente Dinheiro</option>
              <option value="SOMENTE_A_VISTA">Somente À Vista</option>
              <option value="PERSONALIZADO">Personalizado (selecionar abaixo)</option>
            </select>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <label for="cliPagtoPadrao" class="form-label small fw-medium">
              Tipo de Pagamento Padrão
            </label>
            <select
              id="cliPagtoPadrao"
              v-model="formulario.tipo_pagamento_padrao_id"
              class="form-select form-select-sm"
            >
              <option value="">Sem padrão definido</option>
              <option
                v-for="tp in tiposPagamento"
                :key="tp.id"
                :value="tp.id"
              >
                {{ tp.codigo }} - {{ tp.descricao }}
              </option>
            </select>
          </div>

          <div class="col-12 col-lg-4 d-flex align-items-lg-end">
            <div class="form-check form-switch">
              <input
                id="clienteAtivo"
                v-model="formulario.ativo"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label small" for="clienteAtivo">
                Cliente Ativo
              </label>
            </div>
          </div>

          <div
            v-if="formulario.politica_pagamento === 'PERSONALIZADO'"
            class="col-12"
          >
            <span class="form-label small fw-medium d-block">
              Tipos de Pagamento Autorizados para este Cliente
            </span>
            <div class="d-flex flex-wrap gap-3">
              <div
                v-for="tp in tiposPagamento"
                :key="tp.id"
                class="form-check"
              >
                <input
                  :id="`tp-cli-${tp.id}`"
                  v-model="formulario.tipos_pagamento_ids"
                  :value="tp.id"
                  type="checkbox"
                  class="form-check-input"
                />
                <label class="form-check-label small" :for="`tp-cli-${tp.id}`">
                  {{ tp.codigo }} - {{ tp.descricao }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Clientes Cadastrados -->
    <div class="card border rounded-3">
      <div class="card-body p-3 p-md-4">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
          <h3 class="h6 fw-semibold mb-0">
            Clientes Cadastrados ({{ clientesFiltrados.length }})
          </h3>

          <input
            v-model="buscaTexto"
            type="text"
            class="form-control form-control-sm busca-clientes-input"
            placeholder="Buscar por nome, CPF/CNPJ, perfil, operação ou cidade..."
            aria-label="Buscar por nome, CPF/CNPJ, perfil, operação ou cidade"
          />
        </div>

        <div v-if="carregando" class="text-muted small py-3">
          Carregando clientes...
        </div>

        <div v-else-if="clientesFiltrados.length === 0" class="text-muted small py-3">
          Nenhum cliente cadastrado ainda.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr class="small text-muted">
                <th>CPF/CNPJ</th>
                <th>Nome / Razão Social</th>
                <th class="d-none d-md-table-cell">Perfil</th>
                <th class="d-none d-lg-table-cell">Operação</th>
                <th class="d-none d-md-table-cell">indIEDest</th>
                <th class="d-none d-sm-table-cell">Município / UF</th>
                <th class="d-none d-lg-table-cell">Política Pagto</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in clientesFiltrados" :key="row.id">
                <td class="fw-semibold text-nowrap">{{ row.cpf_cnpj }}</td>
                <td>{{ row.nome_razao_social }}</td>
                <td class="d-none d-md-table-cell">
                  <span class="badge bg-light text-dark border">
                    {{ row.perfil_cliente || "PADRAO" }}
                  </span>
                </td>
                <td class="d-none d-lg-table-cell">
                  <span class="badge bg-light text-dark border">
                    {{ row.tipo_operacao || "VENDA" }}
                  </span>
                </td>
                <td class="d-none d-md-table-cell">{{ row.indicador_ie_destinatario }}</td>
                <td class="d-none d-sm-table-cell">
                  {{ row.nome_municipio || "-" }}{{ row.uf ? ` - ${row.uf}` : "" }}
                </td>
                <td class="d-none d-lg-table-cell">
                  <span class="badge bg-light text-dark border">
                    {{ row.politica_pagamento }}
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
                <td class="text-end text-nowrap">
                  <button
                    type="button"
                    class="btn btn-outline-primary btn-sm me-1"
                    @click="editarCliente(row)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="excluirCliente(row.id)"
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
import { useCadastroClientes } from "../composables/useCadastroClientes.js";

const router = useRouter();

const {
  tiposPagamento,
  perfisCliente,
  tiposOperacao,
  clientesFiltrados,
  formulario,
  carregando,
  salvando,
  mensagemErro,
  mensagemSucesso,
  buscaTexto,
  buscandoCnpj,
  limparFormulario,
  formatarDocumento,
  aoAlterarTipoPessoa,
  aoAlterarIndicadorIe,
  formatarInscricaoEstadual,
  formatarTelefone,
  formatarCep,
  formatarUf,
  formatarIbge,
  aoAlterarPoliticaPagamento,
  editarCliente,
  carregarDadosIniciais,
  salvarCliente,
  excluirCliente,
} = useCadastroClientes();

function voltarParaHome() {
  router.push({ name: "home" });
}

onMounted(() => {
  carregarDadosIniciais();
});
</script>

<style scoped>
.cadastro-clientes-form {
  background-color: #f8fafc;
  min-height: 100%;
  overflow-x: hidden;
}

.cadastro-clientes-form .card {
  border-color: rgba(15, 23, 42, 0.1) !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.cadastro-clientes-form .form-label {
  color: #334155;
}

.cadastro-clientes-form .form-control:focus,
.cadastro-clientes-form .form-select:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 0.15rem rgba(15, 23, 42, 0.12);
}

.cadastro-clientes-form .busca-clientes-input {
  width: 280px;
  max-width: 100%;
}

@media (max-width: 575.98px) {
  .cadastro-clientes-form .busca-clientes-input {
    width: 100%;
  }

  .cadastro-clientes-form .table .btn {
    padding: 0.2rem 0.45rem;
    font-size: 0.75rem;
  }
}

.cadastro-clientes-form .table th {
  white-space: nowrap;
  font-weight: 600;
}

.cadastro-clientes-form .table td {
  vertical-align: middle;
}
</style>