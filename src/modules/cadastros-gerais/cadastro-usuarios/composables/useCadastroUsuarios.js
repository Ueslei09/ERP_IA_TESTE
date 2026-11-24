import { ref, computed } from "vue";
import { usuariosService } from "../services/usuariosServices.js";

function formularioInicial() {
  return {
    id: null,
    funcionario_id: "",
    departamento_id: "",
    name: "",
    email: "",
    password: "",
    role: "usuario",
    is_active: true,
  };
}

export function useCadastroUsuarios() {
  const usuarios = ref([]);
  const funcionarios = ref([]);
  const departamentos = ref([]);
  const form = ref(formularioInicial());
  const filtros = ref({
    busca: "",
    role: "TODOS",
    departamento_id: "",
    is_active: "",
  });

  const carregando = ref(false);
  const salvando = ref(false);
  const mensagemErro = ref("");
  const mensagemSucesso = ref("");

  const isEditando = computed(() => Boolean(form.value.id));

  const resumo = computed(() => {
    const lista = usuarios.value;
    return {
      total: lista.length,
      ativos: lista.filter((u) => Boolean(u.is_active)).length,
      comAcessoErp: lista.filter((u) => Boolean(u.is_active) && Boolean(u.funcionario_id)).length,
      semVinculo: lista.filter((u) => !u.funcionario_id).length,
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

  function aoSelecionarFuncionario() {
    const selecionado = funcionarios.value.find(
      (f) => Number(f.id) === Number(form.value.funcionario_id)
    );
    if (!selecionado) return;

    if (!form.value.name) {
      form.value.name = selecionado.nome_completo || "";
    }
    if (!form.value.email && selecionado.email) {
      form.value.email = selecionado.email;
    }
    if (!form.value.departamento_id && selecionado.departamento_id) {
      form.value.departamento_id = selecionado.departamento_id;
    }
  }

  function editarUsuario(item) {
    form.value = {
      id: item.id,
      funcionario_id: item.funcionario_id || "",
      departamento_id: item.departamento_id || "",
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: item.role || "usuario",
      is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
    };
    limparMensagens();
  }

  async function carregarFuncionarios() {
    try {
      funcionarios.value = await usuariosService.listarFuncionariosAtivos();
    } catch {
      funcionarios.value = [];
    }
  }

  async function carregarDepartamentos() {
    try {
      departamentos.value = await usuariosService.listarDepartamentos();
    } catch {
      departamentos.value = [];
    }
  }

  async function carregarUsuarios() {
    carregando.value = true;
    mensagemErro.value = "";
    try {
      usuarios.value = await usuariosService.listar(filtros.value);
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao carregar usuários.";
    } finally {
      carregando.value = false;
    }
  }

  async function salvarUsuario() {
    limparMensagens();

    if (!form.value.funcionario_id) {
      mensagemErro.value =
        "Vincule um funcionário para liberar o acesso às rotinas do ERP.";
      return;
    }

    const senhaLimpa = String(form.value.password || "").replace(/\D/g, "");
    if (!isEditando.value && !/^\d{6}$/.test(senhaLimpa)) {
      mensagemErro.value = "A senha inicial deve ter exatamente 6 números.";
      return;
    }
    if (senhaLimpa && !/^\d{6}$/.test(senhaLimpa)) {
      mensagemErro.value = "A senha deve ter exatamente 6 números.";
      return;
    }

    salvando.value = true;
    try {
      const payload = {
        ...form.value,
        password: senhaLimpa || undefined,
      };
      await usuariosService.salvar(payload);
      novoCadastro();
      mensagemSucesso.value = "Usuário salvo e vinculado ao funcionário com sucesso!";
      await carregarUsuarios();
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao salvar usuário.";
    } finally {
      salvando.value = false;
    }
  }

  async function excluirUsuario(item) {
    salvando.value = true;
    limparMensagens();
    try {
      await usuariosService.excluir(item.id);
      if (form.value.id === item.id) {
        novoCadastro();
      }
      mensagemSucesso.value = "Usuário excluído com sucesso!";
      await carregarUsuarios();
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao excluir usuário.";
    } finally {
      salvando.value = false;
    }
  }

  return {
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
  };
}