<!-- src/views/HomeErpView.vue -->
<template>
  <NavbarErp />

  <RelatorioClientes v-if="isRelatorioClientesRoute" />
  <CadastroFuncionario v-else-if="isFuncionarioRoute" />
  <CadastroDepartamento v-else-if="isDepartamentoRoute" />
  <Tipodeoperacao v-else-if="isTipoOperacaoRoute" />
  <CadastroPerfilCliente v-else-if="isPerfilClienteRoute" />
  <NeighborhoodRegistrationPanel v-else-if="isNeighborhoodRoute" />
  <CityRegistrationPanel v-else-if="isCityRoute" />
  <StateRegistrationPanel v-else-if="isStateRoute" />
  <CadastroTipoPagamento v-else-if="isTipoPagamentoRoute" />
  <CadastroClientes v-else-if="isCustomerRoute" />
  <HomeErpPanel v-else />
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import NavbarErp from "@/shared/components/NavbarErp.vue";
import HomeErpPanel from "../components/HomeErpPanel.vue";

import StateRegistrationPanel from "@/shared/components/ControlesPessoas/StateRegistrationPanel.vue";
import CityRegistrationPanel from "@/shared/components/ControlesPessoas/CityRegistration.vue";
import NeighborhoodRegistrationPanel from "@/shared/components/ControlesPessoas/NeighborhoodsPanel.vue";
import CadastroTipoPagamento from "@/shared/components/ControlesPessoas/CadastroTipoPagamentos.vue";
import CadastroClientes from "@/modules/cadastros-gerais/pessoas/cadastro-clientes/components/CadastroClientes.vue";
import CadastroPerfilCliente from "@/shared/components/ControlesPessoas/CadastroPerfilCliente.vue";
import Tipodeoperacao from "@/shared/components/ControlesPessoas/Tipodeoperacao.vue";
import RelatorioClientes from "@/modules/cadastros-gerais/pessoas/relatorios-gerais/relatorio-clientes/components/RelatorioClientes.vue";
import CadastroDepartamento from "@/shared/components/ControlesPessoas/CadastroDepartamento.vue";
import CadastroFuncionario from "@/modules/cadastros-gerais/cadastro-funcionarios/components/CadastroFuncionarios.vue";
const route = useRoute();

const isNeighborhoodRoute = computed(
  () => route.name === "bairros" || route.path === "/cadastros/bairros"
);

const isCityRoute = computed(
  () => route.name === "cidades" || route.path === "/cadastros/cidades"
);

const isStateRoute = computed(
  () => route.name === "estados" || route.path === "/cadastros/estados"
);

const isTipoPagamentoRoute = computed(
  () =>
    route.name === "tipos-pagamento" ||
    route.path === "/cadastros/tipos-pagamento"
);

const isCustomerRoute = computed(
  () => route.name === "clientes" || route.path === "/cadastros/clientes"
);

const isPerfilClienteRoute = computed(
  () =>
    route.name === "perfis-cliente" ||
    route.path === "/cadastros/perfis-cliente"
);

const isTipoOperacaoRoute = computed(
  () =>
    route.name === "tipos-operacao" ||
    route.path === "/cadastros/tipos-operacao"
);

const isRelatorioClientesRoute = computed(
  () =>
    [
      "/cadastros/relatorios/clientes",
      "/cadastros-gerais/pessoas/relatorios-gerais/relatorio-clientes",
    ].includes(route.path) || route.name === "relatorio-clientes"
);

const isDepartamentoRoute = computed(
  () =>
    route.name === "departamentos" ||
    route.path === "/cadastros/departamentos"
);
const isFuncionarioRoute = computed(
  () =>
    route.name === "funcionarios" ||
    route.path === "/cadastros/funcionarios"
);
</script>