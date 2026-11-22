// src/compartilhado/composaveis/useTipoPagamento.js
import { ref, computed } from "vue";
import { tipoPagamentoServico } from "@/shared/services/ControlesPessoasServices/tipoPagamentosServices.js";

const FORMULARIO_INICIAL = () => ({
  id: null,
  codigo: "",
  descricao: "",
  natureza: "DINHEIRO",
  ordem_exibicao: 1,
  somente_a_vista: true,
  permite_parcelamento: false,
  max_parcelas: 1,
  intervalo_dias: 0,
  gera_duplicata: false,
  exige_baixa: false,
  ativo: true,
});

export function useTipoPagamento() {
  const itens = ref([]);
  const formulario = ref(FORMULARIO_INICIAL());
  const carregando = ref(false);
  const salvando = ref(false);
  const mensagemErro = ref("");
  const mensagemSucesso = ref("");
  const buscaTexto = ref("");

  const itensFiltrados = computed(() => {
    const termo = buscaTexto.value.trim().toLowerCase();
    const lista = [...itens.value].sort((a, b) => {
      if (a.ordem_exibicao !== b.ordem_exibicao) {
        return Number(a.ordem_exibicao) - Number(b.ordem_exibicao);
      }
      return String(a.codigo || "").localeCompare(String(b.codigo || ""), "pt-BR", {
        numeric: true,
      });
    });

    if (!termo) return lista;
    return lista.filter(
      (row) =>
        String(row.codigo || "").toLowerCase().includes(termo) ||
        String(row.descricao || "").toLowerCase().includes(termo) ||
        String(row.natureza || "").toLowerCase().includes(termo)
    );
  });

  function limparMensagens() {
    mensagemErro.value = "";
    mensagemSucesso.value = "";
  }

  function limparFormulario() {
    const proximaOrdem =
      itens.value.length > 0
        ? Math.max(...itens.value.map((i) => Number(i.ordem_exibicao) || 0)) + 1
        : 1;
    formulario.value = {
      ...FORMULARIO_INICIAL(),
      ordem_exibicao: proximaOrdem,
    };
    limparMensagens();
  }

  function aplicarPredefinicaoNatureza() {
    const nat = formulario.value.natureza;
    if (nat === "DINHEIRO") {
      formulario.value.somente_a_vista = true;
      formulario.value.permite_parcelamento = false;
      formulario.value.max_parcelas = 1;
      formulario.value.intervalo_dias = 0;
      formulario.value.gera_duplicata = false;
      formulario.value.exige_baixa = false;
    } else if (nat === "PIX" || nat === "DEBITO" || nat === "CREDITO_AVISTA") {
      formulario.value.somente_a_vista = true;
      formulario.value.permite_parcelamento = false;
      formulario.value.max_parcelas = 1;
      formulario.value.intervalo_dias = 0;
      formulario.value.gera_duplicata = nat === "CREDITO_AVISTA";
      formulario.value.exige_baixa = nat === "CREDITO_AVISTA";
    } else if (nat === "CREDITO_PARCELADO" || nat === "A_PRAZO") {
      formulario.value.somente_a_vista = false;
      formulario.value.permite_parcelamento = true;
      formulario.value.max_parcelas = formulario.value.max_parcelas > 1 ? formulario.value.max_parcelas : 3;
      formulario.value.intervalo_dias = formulario.value.intervalo_dias > 0 ? formulario.value.intervalo_dias : 30;
      formulario.value.gera_duplicata = true;
      formulario.value.exige_baixa = true;
    }
  }

  function editarTipoPagamento(row) {
    limparMensagens();
    formulario.value = {
      id: row.id ?? null,
      codigo: row.codigo || "",
      descricao: row.descricao || "",
      natureza: row.natureza || "OUTRO",
      ordem_exibicao: Number(row.ordem_exibicao) || 1,
      somente_a_vista: Boolean(row.somente_a_vista),
      permite_parcelamento: Boolean(row.permite_parcelamento),
      max_parcelas: Number(row.max_parcelas) || 1,
      intervalo_dias: Number(row.intervalo_dias) || 0,
      gera_duplicata: Boolean(row.gera_duplicata),
      exige_baixa: Boolean(row.exige_baixa),
      ativo: row.ativo !== undefined ? Boolean(row.ativo) : true,
    };
  }

  async function carregarTiposPagamento() {
    carregando.value = true;
    mensagemErro.value = "";
    try {
      itens.value = await tipoPagamentoServico.listar();
      if (!formulario.value.id) {
        const proximaOrdem =
          itens.value.length > 0
            ? Math.max(...itens.value.map((i) => Number(i.ordem_exibicao) || 0)) + 1
            : 1;
        formulario.value.ordem_exibicao = proximaOrdem;
      }
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao carregar tipos de pagamento.";
    } finally {
      carregando.value = false;
    }
  }

  async function salvarTipoPagamento() {
    limparMensagens();
    const codigoLimpo = String(formulario.value.codigo || "").trim().toUpperCase();
    const descricaoLimpa = String(formulario.value.descricao || "").trim();

    if (!codigoLimpo || !descricaoLimpa) {
      mensagemErro.value = "Informe a numeração/código e a descrição do tipo de pagamento.";
      return;
    }

    salvando.value = true;
    try {
      await tipoPagamentoServico.salvar({
        ...formulario.value,
        codigo: codigoLimpo,
        descricao: descricaoLimpa,
      });
      await carregarTiposPagamento();
      limparFormulario();
      mensagemSucesso.value = "Tipo de pagamento salvo com sucesso!";
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao salvar tipo de pagamento.";
    } finally {
      salvando.value = false;
    }
  }

  async function excluirTipoPagamento(id) {
    limparMensagens();
    try {
      await tipoPagamentoServico.excluir(id);
      itens.value = itens.value.filter((item) => item.id !== id);
      mensagemSucesso.value = "Tipo de pagamento removido com sucesso.";
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao excluir tipo de pagamento.";
    }
  }

  return {
    itens,
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
  };
}