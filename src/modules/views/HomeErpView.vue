<template>
  <HomeErpPanel
    :records="records"
    :title="title"
    :status-message="statusMessage"
    :is-loading="isLoading"
    @update:title="title = $event"
    @submit="addRecord"
    @delete="deleteRecord"
    @logout="logout"
  />
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHomeErp } from "../composables/useHomeErp";
import HomeErpPanel from "../components/HomeErpPanel.vue";

const router = useRouter();
const {
  records,
  title,
  statusMessage,
  isLoading,
  loadRecords,
  addRecord,
  deleteRecord,
  logout,
} = useHomeErp(router);

onMounted(loadRecords)
</script>