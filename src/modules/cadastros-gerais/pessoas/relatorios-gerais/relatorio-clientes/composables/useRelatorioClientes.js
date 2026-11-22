import { ref, computed } from "vue";
import { relatorioClientesService } from "../services/relatorioClientesServices.js";
import { perfilClienteServices } from "@/shared/services/ControlesPessoasServices/perfilClienteServices.js";
import { tipoOperacaoServices } from "@/shared/services/ControlesPessoasServices/tipoOperacaoServices.js";

export function useRelatorioClientes() {
  const clientes = ref([]);
  const perfisCliente = ref([]);
  const tiposOperacao = ref([]);
  const carregando = ref(false);
  const mensagemErro = ref("");

  const filtros = ref({
    busca: "",
    perfil_cliente: "TODOS",
    tipo_operacao: "TODOS",
    uf: "TODOS",
    ativo: "",
  });

  const resumo = computed(() => {
    const lista = clientes.value;
    return {
      total: lista.length,
      ativos: lista.filter((c) => Boolean(c.ativo)).length,
      inativos: lista.filter((c) => !Boolean(c.ativo)).length,
      limiteCreditoTotal: lista.reduce(
        (acc, c) => acc + Number(c.limite_credito || 0),
        0
      ),
      saldoDisponivelTotal: lista.reduce(
        (acc, c) => acc + Number(c.saldo_disponivel || 0),
        0
      ),
    };
  });

  function limparFiltros() {
    filtros.value = {
      busca: "",
      perfil_cliente: "TODOS",
      tipo_operacao: "TODOS",
      uf: "TODOS",
      ativo: "",
    };
    carregarRelatorio();
  }

  async function carregarFiltrosAuxiliares() {
    const [listaPerfis, listaOperacoes] = await Promise.all([
      perfilClienteServices.listar().catch(() => []),
      tipoOperacaoServices.listar().catch(() => []),
    ]);
    perfisCliente.value = listaPerfis;
    tiposOperacao.value = listaOperacoes;
  }

  async function carregarRelatorio() {
    carregando.value = true;
    mensagemErro.value = "";
    try {
      const resposta = await relatorioClientesService.buscar(filtros.value);
      clientes.value = resposta.items;
    } catch (err) {
      mensagemErro.value =
        err?.message || "Erro ao carregar relatório de clientes.";
    } finally {
      carregando.value = false;
    }
  }

  function exportarCsv() {
    const colunas = [
      "ID",
      "CPF/CNPJ",
      "Nome / Razao Social",
      "Perfil",
      "Tipo Operacao",
      "Telefone",
      "Email",
      "Limite Credito",
      "Saldo Disponivel",
      "Status",
    ];

    const linhas = clientes.value.map((c) => [
      c.id ?? "",
      c.cpf_cnpj ?? "",
      `"${String(c.nome_razao_social || c.nome_completo || "").replace(/"/g, '""')}"`,
      c.perfil_cliente ?? "",
      c.tipo_operacao ?? "",
      c.telefone ?? "",
      c.email ?? "",
      Number(c.limite_credito || 0).toFixed(2),
      Number(c.saldo_disponivel || 0).toFixed(2),
      c.ativo ? "Ativo" : "Inativo",
    ]);

    const csv = [colunas.join(";"), ...linhas.map((l) => l.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-clientes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    clientes,
    perfisCliente,
    tiposOperacao,
    filtros,
    resumo,
    carregando,
    mensagemErro,
    limparFiltros,
    carregarFiltrosAuxiliares,
    carregarRelatorio,
    exportarCsv,
  };
}