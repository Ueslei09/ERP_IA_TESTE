import { ref, computed } from "vue";
import { perfilClienteServices } from "@/shared/services/ControlesPessoasServices/perfilClienteServices.js";

const FORMULARIO_INICIAL = () => ({
  id: null,
  codigo: "",
  descricao: "",
  ativo: true,
});

export function useCadastroPerfilCliente() {
  const perfis = ref([]);
  const formulario = ref(FORMULARIO_INICIAL());
  const carregando = ref(false);
  const salvando = ref(false);
  const mensagemErro = ref("");
  const mensagemSucesso = ref("");
  const buscaTexto = ref("");

  const perfisFiltrados = computed(() => {
    const termo = buscaTexto.value.trim().toLowerCase();
    if (!termo) return perfis.value;

    return perfis.value.filter(
      (item) =>
        String(item.codigo || "").toLowerCase().includes(termo) ||
        String(item.descricao || "").toLowerCase().includes(termo)
    );
  });

  function limparMensagens() {
    mensagemErro.value = "";
    mensagemSucesso.value = "";
  }

  function limparFormulario() {
    formulario.value = FORMULARIO_INICIAL();
    limparMensagens();
  }

  function formatarCodigo() {
    formulario.value.codigo = String(formulario.value.codigo || "")
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "")
      .slice(0, 30);
  }

  function editarPerfil(row) {
    limparMensagens();
    formulario.value = {
      id: row.id ?? null,
      codigo: row.codigo || "",
      descricao: row.descricao || "",
      ativo: row.ativo !== undefined ? Boolean(row.ativo) : true,
    };
  }

  async function carregarPerfis() {
    carregando.value = true;
    mensagemErro.value = "";
    try {
      perfis.value = await perfilClienteServices.listar();
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao carregar perfis de cliente.";
    } finally {
      carregando.value = false;
    }
  }

  async function salvarPerfil() {
    limparMensagens();
    const codigoLimpo = String(formulario.value.codigo || "").trim().toUpperCase();
    const descricaoLimpa = String(formulario.value.descricao || "").trim();

    if (!codigoLimpo) {
      mensagemErro.value = "Informe o código do perfil (ex.: PADRAO, VIP).";
      return;
    }

    if (!descricaoLimpa) {
      mensagemErro.value = "Informe a descrição do perfil.";
      return;
    }

    salvando.value = true;
    try {
      await perfilClienteServices.salvar({
        ...formulario.value,
        codigo: codigoLimpo,
        descricao: descricaoLimpa,
      });
      await carregarPerfis();
      limparFormulario();
      mensagemSucesso.value = "Perfil de cliente salvo com sucesso!";
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao salvar perfil de cliente.";
    } finally {
      salvando.value = false;
    }
  }

  async function excluirPerfil(id) {
    limparMensagens();
    try {
      await perfilClienteServices.excluir(id);
      perfis.value = perfis.value.filter((item) => item.id !== id);
      mensagemSucesso.value = "Perfil removido com sucesso.";
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao excluir perfil.";
    }
  }

  return {
    perfis,
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
  };
}