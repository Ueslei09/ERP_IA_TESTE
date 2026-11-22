<template>
  <section class="p-3 p-md-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
      <div>
        <h2 class="h5 fw-bold mb-1">Cadastro de Perfil de Cliente</h2>
        <p class="text-muted small mb-0">
          Defina os perfis disponíveis para classificar os clientes no cadastro.
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
          @click="salvarPerfil"
          :disabled="salvando"
        >
          {{ salvando ? "Salvando..." : "Salvar Perfil" }}
        </button>
      </div>
    </div>

    <div v-if="mensagemErro" class="alert alert-danger py-2 small" role="alert">
      {{ mensagemErro }}
    </div>
    <div v-if="mensagemSucesso" class="alert alert-success py-2 small" role="alert">
      {{ mensagemSucesso }}
    </div>

    <div class="card border rounded-3 mb-3">
      <div class="card-body p-3">
        <div class="row g-3">
          <div class="col-12 col-sm-4 col-lg-3">
            <label for="perfilCodigo" class="form-label small fw-medium">Código *</label>
            <input
              id="perfilCodigo"
              v-model="formulario.codigo"
              type="text"
              maxlength="30"
              class="form-control form-control-sm"
              placeholder="EX.: PADRAO"
              @input="formatarCodigo"
            />
          </div>

          <div class="col-12 col-sm-8 col-lg-6">
            <label for="perfilDescricao" class="form-label small fw-medium">Descrição *</label>
            <input
              id="perfilDescricao"
              v-model="formulario.descricao"
              type="text"
              maxlength="100"
              class="form-control form-control-sm"
              placeholder="Ex.: Cliente Padrão, Atacado, VIP"
            />
          </div>

          <div class="col-12 col-lg-3 d-flex align-items-lg-end">
            <div class="form-check form-switch">
              <input
                id="perfilAtivo"
                v-model="formulario.ativo"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label small" for="perfilAtivo">
                Perfil Ativo
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border rounded-3">
      <div class="card-body p-3">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
          <h3 class="h6 fw-semibold mb-0">
            Perfis Cadastrados ({{ perfisFiltrados.length }})
          </h3>

          <input
            v-model="buscaTexto"
            type="text"
            class="form-control form-control-sm"
            style="max-width: 260px;"
            placeholder="Buscar perfil..."
          />
        </div>

        <div v-if="carregando" class="text-muted small py-2">
          Carregando perfis...
        </div>

        <div v-else-if="perfisFiltrados.length === 0" class="text-muted small py-2">
          Nenhum perfil cadastrado.
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
              <tr v-for="row in perfisFiltrados" :key="row.id || row.codigo">
                <td class="fw-semibold">{{ row.codigo }}</td>
                <td>{{ row.descricao }}</td>
                <td>
                  <span
                    class="badge"
                    :class="row.ativo ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'"
                  >
                    {{ row.ativo ? "Ativo" : "Inativo" }}
                  </span>
                </td>
                <td class="text-end text-nowrap" v-if="row.id">
                  <button
                    type="button"
                    class="btn btn-outline-primary btn-sm me-1"
                    @click="editarPerfil(row)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="excluirPerfil(row.id)"
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
import { useCadastroPerfilCliente } from "@/shared/composables/UseControlesPessoas/useCadastroPerfilCliente.js";

const router = useRouter();

const {
  perfisFiltrados,
  formulario,
  carregando,
  salvando,
  mensagemErro,
  mensagemSucesso,
  buscaTexto,
  limparFormulario,
  formatarCodigo,
  editarPerfil,
  carregarPerfis,
  salvarPerfil,
  excluirPerfil,
} = useCadastroPerfilCliente();

function voltarParaHome() {
  router.push({ name: "home" });
}

onMounted(() => {
  carregarPerfis();
});
</script>