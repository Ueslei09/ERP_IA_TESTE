import { ref, computed } from "vue";
import { tipoOperacaoServices } from "@/shared/services/ControlesPessoasServices/tipoOperacaoServices.js";

const FORMULARIO_INICIAL = () => ({
  id: null,
  codigo: "",
  descricao: "",
  ativo: true,
});

export function useCadastroTipoOperacao() {
  const tiposOperacao = ref([]);
  const formulario = ref(FORMULARIO_INICIAL());
  const carregando = ref(false);
  const salvando = ref(false);
  const mensagemErro = ref("");
  const mensagemSucesso = ref("");
  const buscaTexto = ref("");

  const tiposOperacaoFiltrados = computed(() => {
    const termo = buscaTexto.value.trim().toLowerCase();
    if (!termo) return tiposOperacao.value;

    return tiposOperacao.value.filter(
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
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 30);
}

  function editarTipoOperacao(row) {
    limparMensagens();
    formulario.value = {
      id: row.id ?? null,
      codigo: row.codigo || "",
      descricao: row.descricao || "",
      ativo: row.ativo !== undefined ? Boolean(row.ativo) : true,
    };
  }

  async function carregarTiposOperacao() {
    carregando.value = true;
    mensagemErro.value = "";
    try {
      tiposOperacao.value = await tipoOperacaoServices.listar();
    } catch (err) {
      mensagemErro.value =
        err?.message || "Erro ao carregar tipos de operação.";
    } finally {
      carregando.value = false;
    }
  }

  async function salvarTipoOperacao() {
    limparMensagens();
    const codigoLimpo = String(formulario.value.codigo || "").trim();
    const descricaoLimpa = String(formulario.value.descricao || "").trim();

    if (!codigoLimpo) {
      mensagemErro.value =
        "Informe o código do tipo de operação (ex.: VENDA, ORCAMENTO).";
      return;
    }

    if (!descricaoLimpa) {
      mensagemErro.value = "Informe a descrição do tipo de operação.";
      return;
    }

    salvando.value = true;
    try {
      await tipoOperacaoServices.salvar({
        ...formulario.value,
        codigo: codigoLimpo,
        descricao: descricaoLimpa,
      });
      await carregarTiposOperacao();
      limparFormulario();
      mensagemSucesso.value = "Tipo de operação salvo com sucesso!";
    } catch (err) {
      mensagemErro.value =
        err?.message || "Erro ao salvar tipo de operação.";
    } finally {
      salvando.value = false;
    }
  }

  async function excluirTipoOperacao(id) {
    limparMensagens();
    try {
      await tipoOperacaoServices.excluir(id);
      tiposOperacao.value = tiposOperacao.value.filter(
        (item) => item.id !== id
      );
      mensagemSucesso.value = "Tipo de operação removido com sucesso.";
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao excluir tipo de operação.";
    }
  }

  return {
    tiposOperacao,
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
  };
}