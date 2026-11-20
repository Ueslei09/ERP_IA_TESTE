<template>
  <main class="login-view container-fluid bg-light min-vh-100 d-flex align-items-center py-3 py-md-5 px-3 px-md-4">
    <div class="row g-3 g-lg-4 w-100 mx-auto" style="max-width: 1040px;">
      <div class="col-12 col-lg-6">
        <LoginBrandBanner />
      </div>

      <div class="col-12 col-lg-6">
        <LoginFormCard />
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import LoginBrandBanner from "../components/LoginBrandBanner.vue";
import LoginFormCard from "../components/LoginFormCard.vue";
import { useLogin } from "../composables/useLogin";

const { initParallax, destroyParallax } = useLogin();

onMounted(() => {
  initParallax();
});

onUnmounted(() => {
  destroyParallax();
});
</script>

<style scoped>
.login-view {
  overflow-x: clip;
}
</style>