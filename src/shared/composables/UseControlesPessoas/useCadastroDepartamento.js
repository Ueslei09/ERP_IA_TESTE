import { ref, computed } from "vue";
import { departamentosService } from "@/shared/services/ControlesPessoasServices/departamentosServices.js";

function formularioInicial() {
  return {
    id: null,
    nome: "",
    descricao: "",
    email: "",
    whatsapp: "",
    usar_agente_ia: false,
    ordem_servico: false,
    receber_emails: false,
    receber_comissao: false,
    padrao_sistema: false,
    ativo: true,
  };
}

export function useCadastroDepartamento() {
  const departamentos = ref([]);
  const form = ref(formularioInicial());
  const filtros = ref({
    busca: "",
    ativo: "",
  });

  const carregando = ref(false);
  const salvando = ref(false);
  const mensagemErro = ref("");
  const mensagemSucesso = ref("");

  const isEditando = computed(() => Boolean(form.value.id));

  const resumo = computed(() => {
    const lista = departamentos.value;
    return {
      total: lista.length,
      ativos: lista.filter((d) => Boolean(d.ativo)).length,
      comIa: lista.filter((d) => Boolean(d.usar_agente_ia)).length,
      comOs: lista.filter((d) => Boolean(d.ordem_servico)).length,
    };
  });

  function limparMensagens() {
    mensagemErro.value = "";
    mensagemSucesso.value = "";
  }

  function novoCadastro() {
    form.value = formularioInicial();
    limparMensagens();
  }

  function editarDepartamento(item) {
    form.value = {
      id: item.id,
      nome: item.nome || "",
      descricao: item.descricao || "",
      email: item.email || "",
      whatsapp: item.whatsapp || "",
      usar_agente_ia: Boolean(item.usar_agente_ia),
      ordem_servico: Boolean(item.ordem_servico),
      receber_emails: Boolean(item.receber_emails),
      receber_comissao: Boolean(item.receber_comissao),
      padrao_sistema: Boolean(item.padrao_sistema),
      ativo: item.ativo !== undefined ? Boolean(item.ativo) : true,
    };
    limparMensagens();
  }

  async function carregarDepartamentos() {
    carregando.value = true;
    mensagemErro.value = "";
    try {
      departamentos.value = await departamentosService.listar(filtros.value);
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao carregar departamentos.";
    } finally {
      carregando.value = false;
    }
  }

  async function salvarDepartamento() {
    salvando.value = true;
    limparMensagens();
    try {
      await departamentosService.salvar(form.value);
      mensagemSucesso.value = isEditando.value
        ? "Departamento atualizado com sucesso!"
        : "Departamento cadastrado com sucesso!";
      novoCadastro();
      mensagemSucesso.value = "Operação concluída com sucesso!";
      await carregarDepartamentos();
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao salvar departamento.";
    } finally {
      salvando.value = false;
    }
  }

  async function excluirDepartamento(item) {
    if (item.padrao_sistema || String(item.nome).toLowerCase() === "gestor") {
      mensagemErro.value = "O departamento padrão 'Gestor' não pode ser excluído.";
      return;
    }

    salvando.value = true;
    limparMensagens();
    try {
      await departamentosService.excluir(item.id);
      if (form.value.id === item.id) {
        novoCadastro();
      }
      mensagemSucesso.value = "Departamento excluído com sucesso!";
      await carregarDepartamentos();
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao excluir departamento.";
    } finally {
      salvando.value = false;
    }
  }

  return {
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
  };
}