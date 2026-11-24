import { ref, computed } from "vue";
import { funcionariosService } from "../services/funcionariosServices.js";

function formularioInicial() {
  return {
    id: null,
    cpf: "",
    nome_completo: "",
    tipo_funcionario: "neutro",
    departamento_id: "",
    cliente_id: "",
    transportadora_id: "",
    fornecedor_id: "",
    endereco_id: null,
    cep: "",
    logradouro: "",
    numero: "S/N",
    complemento: "",
    bairro: "",
    codigo_ibge_municipio: "",
    municipio: "",
    uf: "",
    pais: "BRASIL",
    email: "",
    telefone: "",
    comissao_percentual: 0,
    comissao_ativa: false,
    carteira_cliente: "",
    ativo: true,
  };
}

export function useCadastroFuncionario() {
  const funcionarios = ref([]);
  const departamentos = ref([]);
  const vinculosEncontrados = ref(null);
  const form = ref(formularioInicial());
  const filtros = ref({
    busca: "",
    tipo_funcionario: "TODOS",
    departamento_id: "",
    ativo: "",
  });

  const buscandoCep = ref(false);
  const carregando = ref(false);
  const salvando = ref(false);
  const buscandoCpf = ref(false);
  const mensagemErro = ref("");
  const mensagemSucesso = ref("");

  const isEditando = computed(() => Boolean(form.value.id));

  const resumo = computed(() => {
    const lista = funcionarios.value;
    return {
      total: lista.length,
      ativos: lista.filter((f) => Boolean(f.ativo)).length,
      comissionados: lista.filter(
        (f) => Boolean(f.comissao_ativa) || Number(f.comissao_percentual || 0) > 0
      ).length,
      comCarteira: lista.filter((f) => Boolean(String(f.carteira_cliente || "").trim())).length,
    };
  });

  function limparMensagens() {
    mensagemErro.value = "";
    mensagemSucesso.value = "";
  }

  function novoCadastro() {
    form.value = formularioInicial();
    vinculosEncontrados.value = null;
    limparMensagens();
  }

  function editarFuncionario(item) {
    form.value = {
      id: item.id,
      cpf: item.cpf || "",
      nome_completo: item.nome_completo || "",
      tipo_funcionario: item.tipo_funcionario || "neutro",
      departamento_id: item.departamento_id || "",
      cliente_id: item.cliente_id || "",
      transportadora_id: item.transportadora_id || "",
      fornecedor_id: item.fornecedor_id || "",
      endereco_id: item.endereco_id || null,
      cep: item.cep || "",
      logradouro: item.logradouro || "",
      numero: item.numero || "S/N",
      complemento: item.complemento || "",
      bairro: item.bairro || "",
      codigo_ibge_municipio: item.codigo_ibge_municipio || "",
      municipio: item.municipio || "",
      uf: item.uf || "",
      pais: item.pais || "BRASIL",
      email: item.email || "",
      telefone: item.telefone || "",
      comissao_percentual: Number(item.comissao_percentual ?? 0),
      comissao_ativa: Boolean(item.comissao_ativa),
      carteira_cliente: item.carteira_cliente || "",
      ativo: item.ativo !== undefined ? Boolean(item.ativo) : true,
    };
    vinculosEncontrados.value = null;
    limparMensagens();
  }

  async function buscarCepEndereco() {
    const digitos = String(form.value.cep || "").replace(/\D/g, "");
    if (digitos.length !== 8) return;

    buscandoCep.value = true;
    try {
      const res = await funcionariosService.buscarEnderecoPorCep(digitos);
      if (res?.encontrado && res.endereco) {
        form.value.cep = res.endereco.cep || digitos;
        form.value.logradouro = res.endereco.logradouro || form.value.logradouro;
        form.value.numero = res.endereco.numero || form.value.numero || "S/N";
        form.value.complemento = res.endereco.complemento || form.value.complemento;
        form.value.bairro = res.endereco.bairro || form.value.bairro;
        form.value.codigo_ibge_municipio =
          res.endereco.codigo_ibge_municipio || form.value.codigo_ibge_municipio;
        form.value.municipio = res.endereco.municipio || form.value.municipio;
        form.value.uf = res.endereco.uf || form.value.uf;
        form.value.pais = res.endereco.pais || form.value.pais || "BRASIL";
        return;
      }

      const viaCep = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      const dadosCep = await viaCep.json().catch(() => ({}));
      if (!dadosCep?.erro) {
        form.value.logradouro = dadosCep.logradouro || form.value.logradouro;
        form.value.complemento = dadosCep.complemento || form.value.complemento;
        form.value.bairro = dadosCep.bairro || form.value.bairro;
        form.value.codigo_ibge_municipio =
          dadosCep.ibge || form.value.codigo_ibge_municipio;
        form.value.municipio = dadosCep.localidade || form.value.municipio;
        form.value.uf = (dadosCep.uf || form.value.uf || "").toUpperCase();
      }
    } catch {
      // silencioso para não travar o preenchimento manual
    } finally {
      buscandoCep.value = false;
    }
  }

  async function verificarCpfVinculos() {
    const digitos = String(form.value.cpf || "").replace(/\D/g, "");
    if (digitos.length !== 11) {
      vinculosEncontrados.value = null;
      return;
    }

    buscandoCpf.value = true;
    try {
      const resultado = await funcionariosService.buscarVinculosPorCpf(digitos);
      vinculosEncontrados.value = resultado;

      if (resultado.cliente?.id && !form.value.cliente_id) {
        form.value.cliente_id = resultado.cliente.id;
      }
      if (resultado.transportadora?.id && !form.value.transportadora_id) {
        form.value.transportadora_id = resultado.transportadora.id;
      }
      if (resultado.fornecedor?.id && !form.value.fornecedor_id) {
        form.value.fornecedor_id = resultado.fornecedor.id;
      }

      const refPessoa =
        resultado.cliente || resultado.transportadora || resultado.fornecedor;
      if (refPessoa) {
        if (!form.value.nome_completo && refPessoa.nome) {
          form.value.nome_completo = refPessoa.nome;
        }
        if (!form.value.email && refPessoa.email) {
          form.value.email = refPessoa.email;
        }
        if (!form.value.telefone && refPessoa.telefone) {
          form.value.telefone = refPessoa.telefone;
        }
      }
    } catch {
      vinculosEncontrados.value = null;
    } finally {
      buscandoCpf.value = false;
    }
  }

  async function carregarDepartamentos() {
    try {
      departamentos.value = await funcionariosService.listarDepartamentos();
    } catch {
      departamentos.value = [];
    }
  }

  async function carregarFuncionarios() {
    carregando.value = true;
    mensagemErro.value = "";
    try {
      funcionarios.value = await funcionariosService.listar(filtros.value);
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao carregar funcionários.";
    } finally {
      carregando.value = false;
    }
  }

  async function salvarFuncionario() {
    salvando.value = true;
    limparMensagens();
    try {
      await funcionariosService.salvar(form.value);
      novoCadastro();
      mensagemSucesso.value = "Funcionário salvo e vinculado com sucesso!";
      await carregarFuncionarios();
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao salvar funcionário.";
    } finally {
      salvando.value = false;
    }
  }

  async function excluirFuncionario(item) {
    salvando.value = true;
    limparMensagens();
    try {
      await funcionariosService.excluir(item.id);
      if (form.value.id === item.id) {
        novoCadastro();
      }
      mensagemSucesso.value = "Funcionário excluído com sucesso!";
      await carregarFuncionarios();
    } catch (err) {
      mensagemErro.value = err?.message || "Erro ao excluir funcionário.";
    } finally {
      salvando.value = false;
    }
  }

  return {
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
  };
}