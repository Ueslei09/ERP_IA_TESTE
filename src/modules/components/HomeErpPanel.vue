<script setup>
defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "",
  },
  statusMessage: {
    type: String,
    default: "",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:title", "submit", "delete", "logout"]);
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">Home ERP (Teste)</h1>
      <button type="button" class="btn btn-outline-danger btn-sm" @click="emit('logout')">
        Sair
      </button>
    </div>

    <div class="alert alert-info py-2 small">
      {{ statusMessage || (isLoading ? "Carregando..." : "Pronto para testar.") }}
    </div>

    <form class="input-group mb-3" @submit.prevent="emit('submit')">
      <input
        :value="title"
        type="text"
        class="form-control"
        placeholder="Digite um título para testar gravação..."
        @input="emit('update:title', $event.target.value)"
      />
      <button type="submit" class="btn btn-primary">Salvar Teste</button>
    </form>

    <ul class="list-group">
      <li
        v-for="item in records"
        :key="item.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <span>
          <strong>#{{ item.id }}</strong> — {{ item.title }} ({{ item.status }})
        </span>
        <button
          type="button"
          class="btn btn-outline-danger btn-sm"
          @click="emit('delete', item.id)"
        >
          Excluir
        </button>
      </li>
      <li v-if="records.length === 0" class="list-group-item text-muted small">
        Nenhum registro ainda.
      </li>
    </ul>
  </div>
</template>