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
            <li class="breadcrumb-item active" aria-current="page">Cadastro de Usuários</li>
          </ol>
        </nav>
        <h4 class="mb-0 fw-bold">
          <i class="bi bi-person-gear me-2 text-primary"></i>
          Cadastro de Usuários
        </h4>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <router-link to="/home" class="btn btn-outline-secondary">
          <i class="bi bi-house-door me-1"></i>
          Home ERP
        </router-link>
        <button type="button" class="btn btn-outline-secondary" @click="novoCadastro">
          <i class="bi bi-person-plus me-1"></i>
          Novo Usuário
        </button>
        <button
          type="button"
          class="btn btn-outline-primary"
          @click="carregarUsuarios"
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

    <!-- Aviso de regra de negócio -->
    <div class="alert alert-info d-flex align-items-start gap-2 mb-4" role="note">
      <i class="bi bi-shield-lock-fill fs-5 mt-0.5"></i>
      <div class="small">
        <strong>Regra de Acesso ao ERP:</strong> O login do usuário é feito pelo
        <strong>e-mail</strong> com senha numérica de <strong>6 dígitos</strong>. É
        <strong>obrigatório vincular um funcionário ativo</strong> para que o usuário tenha
        acesso às rotinas do ERP.
      </div>
    </div>

    <!-- Resumo -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Total de Usuários</div>
            <div class="fs-4 fw-bold">{{ resumo.total }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Usuários Ativos</div>
            <div class="fs-4 fw-bold text-success">{{ resumo.ativos }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Com Acesso às Rotinas ERP</div>
            <div class="fs-4 fw-bold text-primary">{{ resumo.comAcessoErp }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Sem Funcionário Vinculado</div>
            <div class="fs-4 fw-bold text-warning">{{ resumo.semVinculo }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulário -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white py-3 fw-semibold">
        <i class="bi bi-person-badge me-2 text-primary"></i>
        {{ isEditando ? `Editando Usuário: ${form.email}` : "Dados do Usuário e Vínculo com Funcionário" }}
      </div>

      <div class="card-body">
        <form @submit.prevent="salvarUsuario">
          <div class="row g-3">
            <!-- Vínculo obrigatório com Funcionário -->
            <div class="col-12 col-md-6">
              <label class="form-label fw-medium">
                Funcionário Vinculado (Acesso ao ERP) <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person-check"></i></span>
                <select
                  v-model="form.funcionario_id"
                  class="form-select"
                  required
                  @change="aoSelecionarFuncionario"
                >
                  <option value="">Selecione um funcionário...</option>
                  <option
                    v-for="func in funcionarios"
                    :key="func.id"
                    :value="func.id"
                  >
                    #{{ func.id }} — {{ func.nome_completo }} ({{ func.tipo_funcionario }})
                  </option>
                </select>
              </div>
              <div class="form-text">
                Sem funcionário vinculado, o usuário não acessa as rotinas do ERP.
              </div>
            </div>

            <!-- Departamento -->
            <div class="col-12 col-md-6">
              <label class="form-label fw-medium">Departamento</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-diagram-2"></i></span>
                <select v-model="form.departamento_id" class="form-select">
                  <option value="">Selecione...</option>
                  <option
                    v-for="dept in departamentos"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.nome }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Nome do Usuário -->
            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">
                Nome de Exibição <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person"></i></span>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  placeholder="Nome do usuário"
                  required
                />
              </div>
            </div>

            <!-- E-mail (Login) -->
            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">
                E-mail de Login <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope-at"></i></span>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  placeholder="usuario@empresa.com.br"
                  required
                />
              </div>
            </div>

            <!-- Senha numérica de 6 dígitos -->
            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">
                Senha Numérica (6 dígitos)
                <span v-if="!isEditando" class="text-danger">*</span>
              </label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-key"></i></span>
                <input
                  v-model="form.password"
                  type="password"
                  inputmode="numeric"
                  pattern="\d{6}"
                  maxlength="6"
                  class="form-control"
                  :placeholder="isEditando ? 'Deixe vazio para manter' : '000000'"
                  :required="!isEditando"
                  @input="form.password = String(form.password || '').replace(/\D/g, '').slice(0, 6)"
                />
              </div>
              <div class="form-text">
                {{ isEditando ? "Preencha apenas se desejar alterar (6 números)." : "Exatamente 6 números (0 a 9)." }}
              </div>
            </div>

            <!-- Perfil / Role -->
            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">
                Perfil de Acesso <span class="text-danger">*</span>
              </label>
              <select v-model="form.role" class="form-select" required>
                <option value="admin">Admin</option>
                <option value="gerente">Gerente</option>
                <option value="supervisor">Supervisor</option>
                <option value="vendedor">Vendedor</option>
                <option value="operador">Operador</option>
                <option value="usuario">Usuário</option>
              </select>
            </div>

            <!-- Status Ativo -->
            <div class="col-12 col-md-8 d-flex align-items-center pt-md-3">
              <div class="form-check form-switch">
                <input
                  id="usuario-ativo"
                  v-model="form.is_active"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label fw-medium" for="usuario-ativo">
                  Usuário Ativo no Sistema
                </label>
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
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <span
                v-if="salvando"
                class="spinner-border spinner-border-sm me-1"
                role="status"
              ></span>
              <i v-else class="bi bi-check-lg me-1"></i>
              {{ isEditando ? "Salvar Alterações" : "Cadastrar Usuário" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Filtros e Listagem -->
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input
                v-model="filtros.busca"
                type="text"
                class="form-control"
                placeholder="Buscar por nome, e-mail, perfil, depto ou funcionário..."
                @keyup.enter="carregarUsuarios"
              />
            </div>
          </div>

          <div class="col-6 col-md-2">
            <select
              v-model="filtros.role"
              class="form-select"
              @change="carregarUsuarios"
            >
              <option value="TODOS">Todos os perfis</option>
              <option value="admin">Admin</option>
              <option value="gerente">Gerente</option>
              <option value="supervisor">Supervisor</option>
              <option value="vendedor">Vendedor</option>
              <option value="operador">Operador</option>
              <option value="usuario">Usuário</option>
            </select>
          </div>

          <div class="col-6 col-md-3">
            <select
              v-model="filtros.departamento_id"
              class="form-select"
              @change="carregarUsuarios"
            >
              <option value="">Todos os departamentos</option>
              <option
                v-for="dept in departamentos"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.nome }}
              </option>
            </select>
          </div>

          <div class="col-6 col-md-1">
            <select
              v-model="filtros.is_active"
              class="form-select"
              @change="carregarUsuarios"
            >
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>

          <div class="col-6 col-md-2 d-grid">
            <button type="button" class="btn btn-dark" @click="carregarUsuarios">
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
                <th>Usuário / Login</th>
                <th>Funcionário / Depto</th>
                <th>Perfil</th>
                <th>Acesso ERP</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usuarios.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  Nenhum usuário encontrado.
                </td>
              </tr>
              <tr v-for="user in usuarios" :key="user.id">
                <td>
                  <div class="fw-semibold">{{ user.name }}</div>
                  <div class="small text-muted">
                    <i class="bi bi-envelope me-1"></i>{{ user.email }}
                  </div>
                </td>
                <td>
                  <div v-if="user.funcionario_id" class="fw-medium">
                    <i class="bi bi-person-badge me-1 text-primary"></i>
                    {{ user.funcionario_nome || `Funcionário #${user.funcionario_id}` }}
                  </div>
                  <span v-else class="badge bg-warning-subtle text-warning">
                    <i class="bi bi-exclamation-triangle me-1"></i>Sem vínculo
                  </span>
                  <div class="small text-muted mt-1">
                    <i class="bi bi-diagram-2 me-1"></i>{{ user.departamento_nome || "—" }}
                  </div>
                </td>
                <td>
                  <span class="badge text-bg-dark text-capitalize">{{ user.role }}</span>
                </td>
                <td>
                  <span
                    v-if="user.possui_acesso_erp"
                    class="badge bg-primary-subtle text-primary"
                  >
                    <i class="bi bi-check2-circle me-1"></i>Liberado
                  </span>
                  <span
                    v-else
                    class="badge bg-danger-subtle text-danger"
                  >
                    <i class="bi bi-lock me-1"></i>Bloqueado
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="
                      user.is_active
                        ? 'bg-success-subtle text-success'
                        : 'bg-secondary-subtle text-secondary'
                    "
                  >
                    {{ user.is_active ? "Ativo" : "Inativo" }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      title="Editar"
                      @click="editarUsuario(user)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger"
                      title="Excluir"
                      @click="excluirUsuario(user)"
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
import { useCadastroUsuarios } from "../composables/useCadastroUsuarios.js";

const {
  usuarios,
  funcionarios,
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
  aoSelecionarFuncionario,
  editarUsuario,
  carregarFuncionarios,
  carregarDepartamentos,
  carregarUsuarios,
  salvarUsuario,
  excluirUsuario,
} = useCadastroUsuarios();

onMounted(async () => {
  await Promise.all([
    carregarFuncionarios(),
    carregarDepartamentos(),
    carregarUsuarios(),
  ]);
});
</script>