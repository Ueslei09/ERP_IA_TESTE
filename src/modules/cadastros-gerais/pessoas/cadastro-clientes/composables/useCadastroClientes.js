import { ref, computed } from "vue";
import {
  cadastroClientesServices,
  buscarCep,
  buscarCnpj,
} from "../services/CadastroClientesServices.js";
import { tipoPagamentoServico } from "@/shared/services/ControlesPessoasServices/tipoPagamentosServices.js";
import { perfilClienteServices } from "@/shared/services/ControlesPessoasServices/perfilClienteServices.js";
import { tipoOperacaoServices } from "@/shared/services/ControlesPessoasServices/tipoOperacaoServices.js";

const FORMULARIO_INICIAL = () => ({
  id: null,
  endereco_id: null,
  tipo_pessoa: "PJ",
  cpf_cnpj: "",
  nome_razao_social: "",
  nome_fantasia: "",
  indicador_ie_destinatario: 9,
  inscricao_estadual: "",
  inscricao_municipal: "",
  suframa: "",
  email: "",
  telefone: "",
  perfil_cliente: "PADRAO",
  tipo_operacao: "a_vista",
  cep: "",
  logradouro: "",
  numero: "S/N",
  complemento: "",
  bairro: "",
  codigo_ibge_municipio: "",
  nome_municipio: "",
  uf: "GO",
  codigo_pais: "1058",
  nome_pais: "BRASIL",
  politica_pagamento: "TODOS",
  tipo_pagamento_padrao_id: "",
  tipos_pagamento_ids: [],
  ativo: true,
});

export function useCadastroClientes() {
  const clientes = ref([]);
  const tiposPagamento = ref([]);
  const perfisCliente = ref([]);
  const tiposOperacao = ref([]);
  const formulario = ref(FORMULARIO_INICIAL());
  const carregando = ref(false);
  const salvando = ref(false);
  const mensagemErro = ref("");
  const mensagemSucesso = ref("");
  const buscaTexto = ref("");
  let ultimoCepBuscado = "";
  let ultimoCnpjBuscado = "";

  const clientesFiltrados = computed(() => {
    const termo = buscaTexto.value.trim().toLowerCase();
    if (!termo) return clientes.value;

    return clientes.value.filter(
      (item) =>
        String(item.nome_razao_social || "").toLowerCase().includes(termo) ||
        String(item.nome_fantasia || "").toLowerCase().includes(termo) ||
        String(item.cpf_cnpj || "").includes(termo) ||
        String(item.nome_municipio || "").toLowerCase().includes(termo) ||
        String(item.perfil_cliente || "").toLowerCase().includes(termo) ||
        String(item.tipo_operacao || "").toLowerCase().includes(termo)
    );
  });

  function limparMensagens() {
    mensagemErro.value = "";
    mensagemSucesso.value = "";
  }

  function limparFormulario() {
    ultimoCepBuscado = "";
    ultimoCnpjBuscado = "";
    formulario.value = FORMULARIO_INICIAL();
    limparMensagens();
  }

  async function consultarCnpjAutomatico(cnpjLimpo) {
    if (cnpjLimpo.length !== 14) {
      ultimoCnpjBuscado = "";
      return;
    }

    if (cnpjLimpo === ultimoCnpjBuscado) return;
    ultimoCnpjBuscado = cnpjLimpo;

    mensagemErro.value = "";
    try {
      const empresa = await buscarCnpj(cnpjLimpo);

      formulario.value.nome_razao_social =
        empresa.nome_razao_social || formulario.value.nome_razao_social;
      formulario.value.nome_fantasia =
        empresa.nome_fantasia || formulario.value.nome_fantasia;

      if (!formulario.value.email && empresa.email) {
        formulario.value.email = empresa.email;
      }
      if (!formulario.value.telefone && empresa.telefone) {
        formulario.value.telefone = empresa.telefone.slice(0, 15);
      }

      formulario.value.cep = empresa.cep || formulario.value.cep;
      formulario.value.logradouro =
        empresa.logradouro || formulario.value.logradouro;
      formulario.value.numero = empresa.numero || formulario.value.numero;
      formulario.value.complemento =
        empresa.complemento || formulario.value.complemento;
      formulario.value.bairro = empresa.bairro || formulario.value.bairro;
      formulario.value.nome_municipio =
        empresa.nome_municipio || formulario.value.nome_municipio;
      formulario.value.uf = empresa.uf || formulario.value.uf;
      formulario.value.codigo_ibge_municipio =
        empresa.codigo_ibge_municipio || formulario.value.codigo_ibge_municipio;

      if (empresa.cep && empresa.cep.length === 8) {
        ultimoCepBuscado = empresa.cep;
      }
    } catch (err) {
      ultimoCnpjBuscado = "";
      mensagemErro.value = err?.message || "Não foi possível consultar o CNPJ.";
    }
  }

  function formatarDocumento() {
    const limite = formulario.value.tipo_pessoa === "PF" ? 11 : 14;
    formulario.value.cpf_cnpj = String(formulario.value.cpf_cnpj || "")
      .replace(/\D/g, "")
      .slice(0, limite);

    if (formulario.value.tipo_pessoa === "PJ") {
      if (formulario.value.cpf_cnpj.length === 14) {
        consultarCnpjAutomatico(formulario.value.cpf_cnpj);
      } else {
        ultimoCnpjBuscado = "";
      }
    } else {
      ultimoCnpjBuscado = "";
    }
  }

  function aoAlterarTipoPessoa() {
    ultimoCnpjBuscado = "";
    formatarDocumento();
    if (
      formulario.value.tipo_pessoa === "PF" &&
      !formulario.value.indicador_ie_destinatario
    ) {
      formulario.value.indicador_ie_destinatario = 9;
    }
  }

  function aoAlterarIndicadorIe(novoValor) {
    const ind = Number(novoValor);
    formulario.value.indicador_ie_destinatario = ind;
    if (ind === 2) {
      formulario.value.inscricao_estadual = "ISENTO";
    } else if (ind === 9 && formulario.value.inscricao_estadual === "ISENTO") {
      formulario.value.inscricao_estadual = "";
    }
  }

  function formatarInscricaoEstadual() {
    formulario.value.inscricao_estadual = String(
      formulario.value.inscricao_estadual || ""
    ).toUpperCase();
  }

  function formatarTelefone() {
    formulario.value.telefone = String(formulario.value.telefone || "")
      .replace(/\D/g, "")
      .slice(0, 15);
  }

  async function formatarCep() {
    const cepLimpo = String(formulario.value.cep || "")
      .replace(/\D/g, "")
      .slice(0, 8);

    formulario.value.cep = cepLimpo;

    if (cepLimpo.length !== 8) {
      ultimoCepBuscado = "";
      return;
    }

    if (cepLimpo === ultimoCepBuscado) return;
    ultimoCepBuscado = cepLimpo;

    mensagemErro.value = "";
    try {
      const endereco = await buscarCep(cepLimpo);
      formulario.value.logradouro = endereco.logradouro || formulario.value.logradouro;
      formulario.value.bairro = endereco.bairro || formulario.value.bairro;
      formulario.value.nome_municipio =
        endereco.nome_municipio || formulario.value.nome_municipio;
      formulario.value.uf = endereco.uf || formulario.value.uf;
      formulario.value.codigo_ibge_municipio =
        endereco.codigo_ibge_municipio || formulario.value.codigo_ibge_municipio;
      if (!formulario.value.complemento && endereco.complemento) {
        formulario.value.complemento = endereco.complemento;
      }
    } catch (err) {
      ultimoCepBuscado = "";
      mensagemErro.value = err?.message || "Não foi possível buscar o CEP.";
    }
  }

  function formatarUf() {
    formulario.value.uf = String(formulario.value.uf || "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 2);
  }

  function formatarIbge() {
    formulario.value.codigo_ibge_municipio = String(
      formulario.value.codigo_ibge_municipio || ""
    )
      .replace(/\D/g, "")
      .slice(0, 7);
  }

  function aoAlterarPoliticaPagamento() {
    if (formulario.value.politica_pagamento !== "PERSONALIZADO") {
      formulario.value.tipos_pagamento_ids = [];
    }
  }

  function editarCliente(row) {
    limparMensagens();
    ultimoCepBuscado = String(row.cep || "").replace(/\D/g, "").slice(0, 8);
    ultimoCnpjBuscado =
      (row.tipo_pessoa || "PJ") === "PJ"
        ? String(row.cpf_cnpj || "").replace(/\D/g, "").slice(0, 14)
        : "";
    formulario.value = {
      id: row.id ?? null,
      endereco_id: row.endereco_id ?? null,
      tipo_pessoa: row.tipo_pessoa || "PJ",
      cpf_cnpj: row.cpf_cnpj || "",
      nome_razao_social: row.nome_razao_social || "",
      nome_fantasia: row.nome_fantasia || "",
      indicador_ie_destinatario: Number(row.indicador_ie_destinatario) || 9,
      inscricao_estadual: row.inscricao_estadual || "",
      inscricao_municipal: row.inscricao_municipal || "",
      suframa: row.suframa || "",
      email: row.email || "",
      telefone: row.telefone || "",
      perfil_cliente: row.perfil_cliente || "PADRAO",
      tipo_operacao: row.tipo_operacao || "a_vista",
      cep: row.cep || "",
      logradouro: row.logradouro || "",
      numero: row.numero || "S/N",
      complemento: row.complemento || "",
      bairro: row.bairro || "",
      codigo_ibge_municipio: row.codigo_ibge_municipio || "",
      nome_municipio: row.nome_municipio || "",
      uf: row.uf || "GO",
      codigo_pais: row.codigo_pais || "1058",
      nome_pais: row.nome_pais || "BRASIL",
      politica_pagamento: row.politica_pagamento || "TODOS",
      tipo_pagamento_padrao_id: row.tipo_pagamento_padrao_id || "",
      tipos_pagamento_ids: Array.isArray(row.tipos_pagamento_ids)
        ? [...row.tipos_pagamento_ids]
        : [],
      ativo: row.ativo !== undefined ? Boolean(row.ativo) : true,
    };
  }

  async function carregarDadosIniciais() {
    carregando.value = true;
    mensagemErro.value = "";
    try {
      const [listaClientes, listaPagamentos, listaPerfis, listaOperacoes] =
        await Promise.all([
          cadastroClientesServices.listar(),
          tipoPagamentoServico.listar({ apenasAtivos: true }).catch(() => []),
          perfilClienteServices.listar().catch(() => []),
          tipoOperacaoServices.listar().catch(() => []),
        ]);
      clientes.value = listaClientes;
      tiposPagamento.value = listaPagamentos;
      perfisCliente.value = listaPerfis;
      tiposOperacao.value = listaOperacoes;
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao carregar clientes.";
    } finally {
      carregando.value = false;
    }
  }

  async function salvarCliente() {
    limparMensagens();
    const doc = String(formulario.value.cpf_cnpj || "").replace(/\D/g, "");
    const razao = String(formulario.value.nome_razao_social || "").trim();
    const perfil =
      String(formulario.value.perfil_cliente || "PADRAO")
        .trim()
        .toUpperCase() || "PADRAO";
    const operacaoBruta = String(formulario.value.tipo_operacao || "a_vista")
      .trim()
      .toLowerCase();
    const operacao = ["a_vista", "a_prazo"].includes(operacaoBruta)
      ? operacaoBruta
      : "a_vista";
    const tamanhoEsperado = formulario.value.tipo_pessoa === "PF" ? 11 : 14;

    if (doc.length !== tamanhoEsperado) {
      mensagemErro.value =
        formulario.value.tipo_pessoa === "PF"
          ? "Informe um CPF válido com 11 dígitos."
          : "Informe um CNPJ válido com 14 dígitos.";
      return;
    }

    if (!razao) {
      mensagemErro.value = "Informe o Nome / Razão Social do cliente.";
      return;
    }

    if (
      Number(formulario.value.indicador_ie_destinatario) === 1 &&
      !String(formulario.value.inscricao_estadual || "").trim()
    ) {
      mensagemErro.value =
        "Para contribuinte ICMS (indicador 1), informe a Inscrição Estadual ou ISENTO.";
      return;
    }

    salvando.value = true;
    try {
      await cadastroClientesServices.salvar({
        ...formulario.value,
        cpf_cnpj: doc,
        nome_razao_social: razao,
        perfil_cliente: perfil,
        tipo_operacao: operacao,
        tipo_pagamento_padrao_id: formulario.value.tipo_pagamento_padrao_id || null,
      });
      await carregarDadosIniciais();
      limparFormulario();
      mensagemSucesso.value = "Cliente salvo com sucesso!";
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao salvar cliente.";
    } finally {
      salvando.value = false;
    }
  }

  async function excluirCliente(id) {
    limparMensagens();
    try {
      await cadastroClientesServices.excluir(id);
      clientes.value = clientes.value.filter((item) => item.id !== id);
      mensagemSucesso.value = "Cliente removido com sucesso.";
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao excluir cliente.";
    }
  }

  return {
    clientes,
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
  };
}