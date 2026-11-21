<!-- src/views/HomeErpView.vue -->
<template>
  <NavbarErp />
  <CityRegistrationPanel v-if="isCityRoute" />
  <StateRegistrationPanel v-if="isStateRoute" />
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
import CityRegistrationPanel from "../components/CityResgistration.vue/index.js";

const route = useRoute();

const isStateRoute = computed(() => {
  return route.name === "estados" || route.path === "/cadastros/estados";
});

const isCustomerRoute = computed(() => {
  return route.name === "clientes" || route.path === "/cadastros/clientes";
});
</script>