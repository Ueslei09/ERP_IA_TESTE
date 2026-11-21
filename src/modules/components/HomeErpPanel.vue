<template>
  <section class="erp-hero-stage position-relative w-100">
    <div class="erp-hero-media-layer" aria-hidden="true">
      <video
        v-if="backgroundConfig.activeType === 'video'"
        class="erp-hero-media"
        :src="backgroundConfig.videoSrc"
        :poster="backgroundConfig.videoPoster || backgroundConfig.imageSrc"
        autoplay
        muted
        loop
        playsinline
        @error="handleMediaError"
      ></video>

      <img
        v-else-if="backgroundConfig.activeType === 'image'"
        class="erp-hero-media"
        :src="backgroundConfig.imageSrc"
        :alt="backgroundConfig.imageAlt || 'Fundo do sistema ERP'"
        @error="handleMediaError"
      />

      <div v-else class="erp-hero-media erp-hero-fallback"></div>

      <div
        class="erp-hero-overlay"
        :style="{ backgroundColor: backgroundConfig.overlayColor || 'rgba(10, 25, 47, 0.42)' }"
      ></div>
    </div>

    <div class="container position-relative z-1 py-4 py-md-5 text-white">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
        <h1 class="h4 fw-bold mb-0">Bem vindo!!</h1>
        
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useHomeErp } from "../composables/useHomeErp";

const router = useRouter();
const { backgroundConfig, handleMediaError, logout } = useHomeErp(router);
</script>

<style scoped>
.erp-hero-stage {
  min-height: calc(100vh - 56px);
  min-height: calc(100dvh - 56px);
  overflow: hidden;
}

.erp-hero-media-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.erp-hero-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.erp-hero-fallback {
  background: linear-gradient(135deg, #0a192f 0%, #163a6b 100%);
}

.erp-hero-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

@media (max-width: 575.98px) {
  .erp-hero-stage {
    min-height: calc(100dvh - 52px);
  }
}
</style>