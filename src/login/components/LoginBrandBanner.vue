<template>
  <aside
    class="login-banner rounded-4 p-4 p-lg-5 text-white d-flex flex-column justify-content-between h-100 position-relative overflow-hidden shadow"
    :aria-label="activeMedia.alt"
  >
    <div class="login-parallax-layer" :style="parallaxStyle" aria-hidden="true"></div>

    <div class="position-relative z-1">
      <span class="badge text-bg-light text-primary fw-semibold mb-3 px-3 py-2 rounded-pill">
        <i :class="['bi', config.brand.badgeIcon, 'me-1']" aria-hidden="true"></i>
        {{ config.brand.badgeText }}
      </span>

      <!-- Tipo Imagem -->
      <figure v-if="activeMedia.type === 'image'" class="m-0 mb-3">
        <img
          :src="activeMedia.src"
          :alt="activeMedia.alt"
          class="img-fluid rounded-3 w-100 login-media-box"
          @error="markMediaFailed"
        />
        <figcaption class="visually-hidden">{{ activeMedia.alt }}</figcaption>
      </figure>

      <!-- Tipo Vídeo -->
      <figure v-else-if="activeMedia.type === 'video'" class="m-0 mb-3">
        <video
          :src="activeMedia.src"
          :poster="activeMedia.poster || undefined"
          :aria-label="activeMedia.alt"
          autoplay
          loop
          muted
          playsinline
          class="w-100 rounded-3 login-media-box"
          @error="markMediaFailed"
        >
          {{ activeMedia.alt }}
        </video>
        <figcaption class="visually-hidden">{{ activeMedia.alt }}</figcaption>
      </figure>

      <!-- Tipo Texto -->
      <div v-else class="mb-3" role="region" :aria-label="activeMedia.alt">
        <h2 class="h3 fw-bold mb-2">{{ activeMedia.title }}</h2>
        <p class="text-white-50 mb-0">{{ activeMedia.subtitle }}</p>
      </div>
    </div>

    <ul class="list-unstyled d-flex flex-wrap gap-2 position-relative z-1 mt-3 mb-0">
      <li
        v-for="item in config.brand.highlights"
        :key="item.label"
        class="badge bg-white bg-opacity-10 border border-white border-opacity-25 text-white fw-normal px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2"
      >
        <i :class="['bi', item.icon]" aria-hidden="true"></i>
        <span>{{ item.label }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { useLogin } from "../composables/useLogin";

const { config, activeMedia, parallaxStyle, markMediaFailed } = useLogin();
</script>

<style scoped>
.login-banner {
  background: linear-gradient(145deg, #0d6efd 0%, #084298 100%);
  min-height: 220px;
}

.login-parallax-layer {
  position: absolute;
  inset: -24px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.16), transparent 45%),
    radial-gradient(circle at 85% 75%, rgba(13, 202, 240, 0.2), transparent 50%);
  pointer-events: none;
  transition: transform 0.15s ease-out;
}

.login-media-box {
  max-height: 240px;
  object-fit: cover;
}
</style>