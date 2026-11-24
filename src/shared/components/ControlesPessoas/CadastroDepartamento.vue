<template>
  <div class="container-fluid py-4 px-3 px-md-4">
    <!-- Cabeçalho -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1 small">
            <li class="breadcrumb-item">Cadastros Gerais</li>
            <li class="breadcrumb-item">Pessoas</li>
            <li class="breadcrumb-item">Controles</li>
            <li class="breadcrumb-item active" aria-current="page">Cadastro de Departamentos</li>
          </ol>
        </nav>
        <h4 class="mb-0 fw-bold">
          <i class="bi bi-diagram-2-fill me-2 text-primary"></i>
          Cadastro de Departamentos
        </h4>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <router-link to="/home" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-1"></i>
          Voltar ao Home
        </router-link>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="novoCadastro"
        >
          <i class="bi bi-plus-circle me-1"></i>
          Novo Departamento
        </button>
        <button
          type="button"
          class="btn btn-outline-primary"
          @click="carregarDepartamentos"
          :disabled="carregando"
        >
          <i class="bi bi-arrow-clockwise me-1"></i>
          Atualizar
        </button>
      </div>
    </div>

    <!-- Alertas -->
    <div
      v-if="mensagemErro"
      class="alert alert-danger alert-dismissible fade show d-flex align-items-center"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
      <div class="flex-grow-1">{{ mensagemErro }}</div>
      <button type="button" class="btn-close" @click="mensagemErro = ''"></button>
    </div>

    <div
      v-if="mensagemSucesso"
      class="alert alert-success alert-dismissible fade show d-flex align-items-center"
      role="alert"
    >
      <i class="bi bi-check-circle-fill me-2 fs-5"></i>
      <div class="flex-grow-1">{{ mensagemSucesso }}</div>
      <button type="button" class="btn-close" @click="mensagemSucesso = ''"></button>
    </div>

    <!-- Cards de Resumo -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Total de Departamentos</div>
            <div class="fs-4 fw-bold">{{ resumo.total }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Ativos</div>
            <div class="fs-4 fw-bold text-success">{{ resumo.ativos }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Usam Agente de IA</div>
            <div class="fs-4 fw-bold text-primary">{{ resumo.comIa }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Ordem de Serviço</div>
            <div class="fs-4 fw-bold text-info">{{ resumo.comOs }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulário de Cadastro / Edição -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <span class="fw-semibold">
          <i class="bi bi-sliders2 me-2 text-primary"></i>
          {{ isEditando ? `Editando: ${form.nome}` : "Dados do Departamento" }}
        </span>
        <span v-if="form.padrao_sistema" class="badge bg-dark">
          <i class="bi bi-shield-lock me-1"></i> Padrão do Sistema
        </span>
      </div>

      <div class="card-body">
        <form @submit.prevent="salvarDepartamento">
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">
                Nome do Departamento <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.nome"
                type="text"
                class="form-control"
                placeholder="Ex.: Comercial, Suporte, Financeiro"
                required
              />
            </div>

            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">E-mail</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  placeholder="departamento@empresa.com.br"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">WhatsApp</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-whatsapp text-success"></i></span>
                <input
                  v-model="form.whatsapp"
                  type="text"
                  class="form-control"
                  placeholder="(62) 99999-9999"
                />
              </div>
            </div>

            <div class="col-12 col-md-8">
              <label class="form-label fw-medium">Descrição</label>
              <input
                v-model="form.descricao"
                type="text"
                class="form-control"
                placeholder="Responsabilidades ou observações do departamento"
              />
            </div>

            <div class="col-12 col-md-4 d-flex align-items-end">
              <div class="form-check form-switch mb-2">
                <input
                  id="flag-ativo"
                  v-model="form.ativo"
                  class="form-check-input"
                  type="checkbox"
                  :disabled="form.padrao_sistema"
                />
                <label class="form-check-label fw-medium" for="flag-ativo">
                  Departamento Ativo
                </label>
              </div>
            </div>
          </div>

          <hr class="my-4" />

          <!-- Flags Operacionais -->
          <div class="mb-2 fw-semibold text-secondary small text-uppercase">
            Flags e Permissões do Departamento
          </div>
          <div class="row g-3">
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="border rounded p-3 h-100 bg-light-subtle">
                <div class="form-check form-switch">
                  <input
                    id="flag-ia"
                    v-model="form.usar_agente_ia"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label fw-semibold" for="flag-ia">
                    <i class="bi bi-robot me-1 text-primary"></i>
                    Usar Agente de IA
                  </label>
                </div>
                <div class="form-text small mt-1">
                  Habilita atendimento e automações com IA.
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="border rounded p-3 h-100 bg-light-subtle">
                <div class="form-check form-switch">
                  <input
                    id="flag-os"
                    v-model="form.ordem_servico"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label fw-semibold" for="flag-os">
                    <i class="bi bi-wrench-adjustable me-1 text-info"></i>
                    Ordem de Serviço
                  </label>
                </div>
                <div class="form-text small mt-1">
                  Permite atuar em fluxos de Ordem de Serviço.
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="border rounded p-3 h-100 bg-light-subtle">
                <div class="form-check form-switch">
                  <input
                    id="flag-email"
                    v-model="form.receber_emails"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label fw-semibold" for="flag-email">
                    <i class="bi bi-envelope-check me-1 text-warning"></i>
                    Receber E-mails
                  </label>
                </div>
                <div class="form-text small mt-1">
                  Recebe notificações e mensagens por e-mail.
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="border rounded p-3 h-100 bg-light-subtle">
                <div class="form-check form-switch">
                  <input
                    id="flag-comissao"
                    v-model="form.receber_comissao"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label fw-semibold" for="flag-comissao">
                    <i class="bi bi-percent me-1 text-success"></i>
                    Receber Comissão
                  </label>
                </div>
                <div class="form-text small mt-1">
                  Habilita apuração de comissão para o setor.
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex flex-wrap justify-content-end gap-2 mt-4">
            <button
              v-if="isEditando"
              type="button"
              class="btn btn-outline-secondary"
              @click="novoCadastro"
            >
              Cancelar Edição
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="salvando"
            >
              <span
                v-if="salvando"
                class="spinner-border spinner-border-sm me-1"
                role="status"
              ></span>
              <i v-else class="bi bi-check-lg me-1"></i>
              {{ isEditando ? "Salvar Alterações" : "Cadastrar Departamento" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Filtros e Listagem -->
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input
                v-model="filtros.busca"
                type="text"
                class="form-control"
                placeholder="Buscar por nome, e-mail ou WhatsApp..."
                @keyup.enter="carregarDepartamentos"
              />
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select
              v-model="filtros.ativo"
              class="form-select"
              @change="carregarDepartamentos"
            >
              <option value="">Todos os status</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>
          <div class="col-6 col-md-3 d-grid">
            <button
              type="button"
              class="btn btn-dark"
              @click="carregarDepartamentos"
            >
              <i class="bi bi-funnel me-1"></i> Filtrar
            </button>
          </div>
        </div>

        <div v-if="carregando" class="text-center py-4">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Departamento</th>
                <th>Contato</th>
                <th>Flags</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="departamentos.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  Nenhum departamento encontrado.
                </td>
              </tr>
              <tr v-for="dept in departamentos" :key="dept.id">
                <td>
                  <div class="fw-semibold">
                    {{ dept.nome }}
                    <span v-if="dept.padrao_sistema" class="badge bg-dark ms-1">
                      Padrão
                    </span>
                  </div>
                  <div class="small text-muted">{{ dept.descricao || "—" }}</div>
                </td>
                <td class="small">
                  <div v-if="dept.email">
                    <i class="bi bi-envelope me-1 text-secondary"></i>{{ dept.email }}
                  </div>
                  <div v-if="dept.whatsapp">
                    <i class="bi bi-whatsapp me-1 text-success"></i>{{ dept.whatsapp }}
                  </div>
                  <span v-if="!dept.email && !dept.whatsapp" class="text-muted">—</span>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-if="dept.usar_agente_ia" class="badge text-bg-primary">
                      IA
                    </span>
                    <span v-if="dept.ordem_servico" class="badge text-bg-info">
                      OS
                    </span>
                    <span v-if="dept.receber_emails" class="badge text-bg-warning">
                      E-mails
                    </span>
                    <span v-if="dept.receber_comissao" class="badge text-bg-success">
                      Comissão
                    </span>
                    <span
                      v-if="
                        !dept.usar_agente_ia &&
                        !dept.ordem_servico &&
                        !dept.receber_emails &&
                        !dept.receber_comissao
                      "
                      class="text-muted small"
                    >
                      Nenhuma
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="dept.ativo ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'"
                  >
                    {{ dept.ativo ? "Ativo" : "Inativo" }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      title="Editar"
                      @click="editarDepartamento(dept)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger"
                      title="Excluir"
                      :disabled="dept.padrao_sistema"
                      @click="excluirDepartamento(dept)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useCadastroDepartamento } from "@/shared/composables/UseControlesPessoas/useCadastroDepartamento.js";

const {
  departamentos,
  form,
  filtros,
  resumo,
  isEditando,
  carregando,
  salvando,
  mensagemErro,
  mensagemSucesso,
  novoCadastro,
  editarDepartamento,
  carregarDepartamentos,
  salvarDepartamento,
  excluirDepartamento,
} = useCadastroDepartamento();

onMounted(() => {
  carregarDepartamentos();
});
</script>