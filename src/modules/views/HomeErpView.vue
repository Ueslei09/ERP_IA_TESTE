<!-- src/views/HomeErpView.vue -->
<template>
  <NavbarErp />
  <NeighborhoodRegistrationPanel v-if="isNeighborhoodRoute" />
  <CityRegistrationPanel v-else-if="isCityRoute" />
  <StateRegistrationPanel v-else-if="isStateRoute" />
  <CustomerRegistrationPanel v-else-if="isCustomerRoute" />
  <HomeErpPanel v-else />
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import NavbarErp from "@/shared/components/NavbarErp.vue";
import HomeErpPanel from "../components/HomeErpPanel.vue";
import CustomerRegistrationPanel from "../components/CadastroDeClientes.vue";
import StateRegistrationPanel from "../components/StateRegistrationPanel.vue";
import CityRegistrationPanel from "../components/CityRegistration.vue";
import NeighborhoodRegistrationPanel from "../components/NeighborhoodsPanel.vue";

const route = useRoute();

const isNeighborhoodRoute = computed(() => {
  return route.name === "bairros" || route.path === "/cadastros/bairros";
});

const isCityRoute = computed(() => {
  return route.name === "cidades" || route.path === "/cadastros/cidades";
});

const isStateRoute = computed(() => {
  return route.name === "estados" || route.path === "/cadastros/estados";
});

const isCustomerRoute = computed(() => {
  return route.name === "clientes" || route.path === "/cadastros/clientes";
});
</script>