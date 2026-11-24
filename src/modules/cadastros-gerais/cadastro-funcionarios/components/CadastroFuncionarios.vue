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
            <li class="breadcrumb-item active" aria-current="page">Cadastro de Funcionários</li>
          </ol>
        </nav>
        <h4 class="mb-0 fw-bold">
          <i class="bi bi-people-fill me-2 text-primary"></i>
          Cadastro de Funcionários
        </h4>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <router-link to="/home" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-1"></i>
          Voltar ao Home
        </router-link>
        <button type="button" class="btn btn-outline-secondary" @click="novoCadastro">
          <i class="bi bi-person-plus me-1"></i>
          Novo Funcionário
        </button>
        <button
          type="button"
          class="btn btn-outline-primary"
          @click="carregarFuncionarios"
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

    <!-- Resumo -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Total de Funcionários</div>
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
            <div class="text-muted small">Com Comissão</div>
            <div class="fs-4 fw-bold text-primary">{{ resumo.comissionados }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">Com Carteira de Cliente</div>
            <div class="fs-4 fw-bold text-info">{{ resumo.comCarteira }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulário -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white py-3 fw-semibold">
        <i class="bi bi-person-vcard me-2 text-primary"></i>
        {{ isEditando ? `Editando: ${form.nome_completo}` : "Dados do Funcionário" }}
      </div>

      <div class="card-body">
        <form @submit.prevent="salvarFuncionario">
          <div class="row g-3">
            <div class="col-12 col-md-3">
              <label class="form-label fw-medium">CPF</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person-lines-fill"></i></span>
                <input
                  v-model="form.cpf"
                  type="text"
                  class="form-control"
                  placeholder="000.000.000-00"
                  @blur="verificarCpfVinculos"
                  @keydown.enter.prevent="verificarCpfVinculos"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  title="Buscar cadastro existente pelo CPF"
                  :disabled="buscandoCpf"
                  @click="verificarCpfVinculos"
                >
                  <span v-if="buscandoCpf" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-search"></i>
                </button>
              </div>
            </div>

            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">
                Nome Completo <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.nome_completo"
                type="text"
                class="form-control"
                placeholder="Nome completo do funcionário"
                required
              />
            </div>

            <div class="col-12 col-md-3">
              <label class="form-label fw-medium">
                Tipo de Funcionário <span class="text-danger">*</span>
              </label>
              <select v-model="form.tipo_funcionario" class="form-select" required>
                <option value="vendedor">Vendedor</option>
                <option value="vendedor_externo">Vendedor Externo</option>
                <option value="supervisor">Supervisor</option>
                <option value="gerente">Gerente</option>
                <option value="estoque">Estoque</option>
                <option value="caixa">Caixa</option>
                <option value="neutro">Neutro</option>
              </select>
            </div>

            <div class="col-12 col-md-2">
              <label class="form-label fw-medium">Departamento</label>
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

            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">E-mail</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  placeholder="funcionario@empresa.com.br"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <label class="form-label fw-medium">Telefone</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                <input
                  v-model="form.telefone"
                  type="text"
                  class="form-control"
                  placeholder="(62) 99999-9999"
                />
              </div>
            </div>

            <div class="col-6 col-md-2">
              <label class="form-label fw-medium">Comissão (%)</label>
              <div class="input-group">
                <input
                  v-model.number="form.comissao_percentual"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  class="form-control"
                />
                <span class="input-group-text">%</span>
              </div>
            </div>

            <div class="col-6 col-md-2 d-flex align-items-end">
              <div class="form-check form-switch mb-2">
                <input
                  id="func-comissao-ativa"
                  v-model="form.comissao_ativa"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label fw-medium" for="func-comissao-ativa">
                  Comissão Ativa
                </label>
              </div>
            </div>

            <div class="col-12 col-md-9">
              <label class="form-label fw-medium">Carteira de Cliente</label>
              <input
                v-model="form.carteira_cliente"
                type="text"
                class="form-control"
                placeholder="Ex.: Região Sul, Clientes Atacado, Carteira VIP..."
              />
            </div>

            <div class="col-12 col-md-3 d-flex align-items-end">
              <div class="form-check form-switch mb-2">
                <input
                  id="func-ativo"
                  v-model="form.ativo"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label fw-medium" for="func-ativo">
                  Funcionário Ativo
                </label>
              </div>
            </div>

            <!-- Vínculos por CPF -->
            <div class="col-12">
              <div class="border rounded p-3 bg-light-subtle">
                <div class="fw-semibold small text-secondary text-uppercase mb-2">
                  <i class="bi bi-link-45deg me-1"></i>
                  Vínculos por CPF (Cliente / Transportadora / Fornecedor)
                </div>

                <div v-if="vinculosEncontrados" class="alert alert-info py-2 px-3 small mb-3">
                  <i class="bi bi-info-circle me-1"></i>
                  CPF localizado em:
                  <span v-if="vinculosEncontrados.cliente" class="badge text-bg-primary ms-1">
                    Cliente #{{ vinculosEncontrados.cliente.id }} ({{ vinculosEncontrados.cliente.nome }})
                  </span>
                  <span v-if="vinculosEncontrados.transportadora" class="badge text-bg-info ms-1">
                    Transportadora #{{ vinculosEncontrados.transportadora.id }} ({{ vinculosEncontrados.transportadora.nome }})
                  </span>
                  <span v-if="vinculosEncontrados.fornecedor" class="badge text-bg-secondary ms-1">
                    Fornecedor #{{ vinculosEncontrados.fornecedor.id }} ({{ vinculosEncontrados.fornecedor.nome }})
                  </span>
                  <span
                    v-if="
                      !vinculosEncontrados.cliente &&
                      !vinculosEncontrados.transportadora &&
                      !vinculosEncontrados.fornecedor
                    "
                    class="text-muted ms-1"
                  >
                    Nenhum cadastro encontrado com esse CPF.
                  </span>
                </div>

                <div class="row g-3">
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-medium">ID Cliente Vinculado</label>
                    <input
                      v-model="form.cliente_id"
                      type="number"
                      class="form-control form-control-sm"
                      placeholder="Ex.: 12"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-medium">ID Transportadora Vinculada</label>
                    <input
                      v-model="form.transportadora_id"
                      type="number"
                      class="form-control form-control-sm"
                      placeholder="Ex.: 5"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <label class="form-label small fw-medium">ID Fornecedor Vinculado</label>
                    <input
                      v-model="form.fornecedor_id"
                      type="number"
                      class="form-control form-control-sm"
                      placeholder="Ex.: 8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr class="my-4" />

          <!-- Endereço (Controles) -->
          <div class="mb-3 fw-semibold text-secondary small text-uppercase">
            <i class="bi bi-geo-alt me-1"></i> Endereço
          </div>
          <div class="row g-3">
            <div class="col-12 col-md-3">
              <label class="form-label fw-medium">CEP</label>
              <div class="input-group">
                <input
                  v-model="form.cep"
                  type="text"
                  class="form-control"
                  placeholder="00000-000"
                  @blur="buscarCepEndereco"
                  @keydown.enter.prevent="buscarCepEndereco"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  title="Buscar endereço cadastrado pelo CEP"
                  :disabled="buscandoCep"
                  @click="buscarCepEndereco"
                >
                  <span v-if="buscandoCep" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-search"></i>
                </button>
              </div>
            </div>
            <div class="col-12 col-md-5">
              <label class="form-label fw-medium">Logradouro</label>
              <input v-model="form.logradouro" type="text" class="form-control" placeholder="Rua / Avenida" />
            </div>
            <div class="col-6 col-md-2">
              <label class="form-label fw-medium">Número</label>
              <input v-model="form.numero" type="text" class="form-control" placeholder="S/N" />
            </div>
            <div class="col-6 col-md-2">
              <label class="form-label fw-medium">Bairro</label>
              <input v-model="form.bairro" type="text" class="form-control" placeholder="Bairro" />
            </div>
            <div class="col-8 col-md-5">
              <label class="form-label fw-medium">Município</label>
              <input v-model="form.municipio" type="text" class="form-control" placeholder="Cidade" />
            </div>
            <div class="col-4 col-md-2">
              <label class="form-label fw-medium">UF</label>
              <input
                v-model="form.uf"
                type="text"
                maxlength="2"
                class="form-control text-uppercase"
                placeholder="GO"
              />
            </div>
            <div class="col-12 col-md-5">
              <label class="form-label fw-medium">Complemento</label>
              <input v-model="form.complemento" type="text" class="form-control" placeholder="Sala, bloco..." />
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
              {{ isEditando ? "Salvar Alterações" : "Cadastrar Funcionário" }}
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
                placeholder="Buscar por nome, CPF, e-mail, telefone ou carteira..."
                @keyup.enter="carregarFuncionarios"
              />
            </div>
          </div>

          <div class="col-6 col-md-3">
            <select
              v-model="filtros.tipo_funcionario"
              class="form-select"
              @change="carregarFuncionarios"
            >
              <option value="TODOS">Todos os tipos</option>
              <option value="vendedor">Vendedor</option>
              <option value="vendedor_externo">Vendedor Externo</option>
              <option value="supervisor">Supervisor</option>
              <option value="gerente">Gerente</option>
              <option value="estoque">Estoque</option>
              <option value="caixa">Caixa</option>
              <option value="neutro">Neutro</option>
            </select>
          </div>

          <div class="col-6 col-md-3">
            <select
              v-model="filtros.departamento_id"
              class="form-select"
              @change="carregarFuncionarios"
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

          <div class="col-12 col-md-2 d-grid">
            <button type="button" class="btn btn-dark" @click="carregarFuncionarios">
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
                <th>Funcionário</th>
                <th>Tipo / Depto</th>
                <th>Contato</th>
                <th>Comissão / Carteira</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="funcionarios.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
              <tr v-for="func in funcionarios" :key="func.id">
                <td>
                  <div class="fw-semibold">{{ func.nome_completo }}</div>
                  <div v-if="func.cpf" class="small text-muted">
                    CPF: {{ func.cpf }}
                  </div>
                  <div class="small text-muted">
                    {{ [func.municipio, func.uf].filter(Boolean).join(" - ") || "—" }}
                  </div>
                </td>
                <td>
                  <span class="badge text-bg-primary text-capitalize">
                    {{ func.tipo_funcionario.replace("_", " ") }}
                  </span>
                  <div class="small text-muted mt-1">
                    <i class="bi bi-diagram-2 me-1"></i>{{ func.departamento_nome || "—" }}
                  </div>
                </td>
                <td class="small">
                  <div v-if="func.email">
                    <i class="bi bi-envelope me-1 text-secondary"></i>{{ func.email }}
                  </div>
                  <div v-if="func.telefone">
                    <i class="bi bi-telephone me-1 text-success"></i>{{ func.telefone }}
                  </div>
                  <span v-if="!func.email && !func.telefone" class="text-muted">—</span>
                </td>
                <td class="small">
                  <div>
                    <i class="bi bi-percent me-1 text-primary"></i>
                    {{ Number(func.comissao_percentual || 0).toFixed(2) }}%
                    <span
                      v-if="func.comissao_ativa"
                      class="badge bg-success-subtle text-success ms-1"
                    >
                      Ativa
                    </span>
                  </div>
                  <div class="text-muted">
                    <i class="bi bi-briefcase me-1"></i>{{ func.carteira_cliente || "—" }}
                  </div>
                  <div class="d-flex flex-wrap gap-1 mt-1">
                    <span v-if="func.cliente_id" class="badge bg-primary-subtle text-primary">
                      Cli #{{ func.cliente_id }}
                    </span>
                    <span v-if="func.transportadora_id" class="badge bg-info-subtle text-info">
                      Transp #{{ func.transportadora_id }}
                    </span>
                    <span v-if="func.fornecedor_id" class="badge bg-secondary-subtle text-secondary">
                      Forn #{{ func.fornecedor_id }}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="
                      func.ativo
                        ? 'bg-success-subtle text-success'
                        : 'bg-secondary-subtle text-secondary'
                    "
                  >
                    {{ func.ativo ? "Ativo" : "Inativo" }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      title="Editar"
                      @click="editarFuncionario(func)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger"
                      title="Excluir"
                      @click="excluirFuncionario(func)"
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
import { useCadastroFuncionario } from "../composables/useCadastroFuncionarios.js";

const {
  funcionarios,
  departamentos,
  vinculosEncontrados,
  form,
  filtros,
  resumo,
  isEditando,
  carregando,
  salvando,
  buscandoCpf,
  buscandoCep,
  mensagemErro,
  mensagemSucesso,
  novoCadastro,
  editarFuncionario,
  verificarCpfVinculos,
  buscarCepEndereco,
  carregarDepartamentos,
  carregarFuncionarios,
  salvarFuncionario,
  excluirFuncionario,
} = useCadastroFuncionario();

onMounted(async () => {
  await Promise.all([carregarDepartamentos(), carregarFuncionarios()]);
});
</script>