<template>
  <section class="card border-0 shadow-sm rounded-4 h-100" :aria-label="config.form.title">
    <div class="card-body p-4 p-sm-5 d-flex flex-column justify-content-center">
      <div class="mb-4">
        <div
          class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
          style="width: 48px; height: 48px; font-size: 1.35rem;"
          aria-hidden="true"
        >
          <i :class="['bi', config.form.headerIcon]"></i>
        </div>
        <h1 class="h4 fw-bold mb-1">{{ config.form.title }}</h1>
        <p class="text-muted small mb-0">{{ config.form.subtitle }}</p>
      </div>

      <form novalidate @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="erp-login-email" class="form-label small fw-semibold">
            {{ config.form.emailLabel }}
          </label>
          <div class="input-group">
            <span class="input-group-text bg-white text-muted" aria-hidden="true">
              <i class="bi bi-envelope"></i>
            </span>
            <input
              id="erp-login-email"
              v-model="email"
              type="email"
              class="form-control"
              :placeholder="config.form.emailPlaceholder"
              autocomplete="email"
              required
            />
          </div>
        </div>

        <div class="mb-3">
          <label for="erp-login-password" class="form-label small fw-semibold">
            {{ config.form.passwordLabel }}
          </label>
          <div class="input-group">
            <span class="input-group-text bg-white text-muted" aria-hidden="true">
              <i class="bi bi-lock"></i>
            </span>
            <input
              id="erp-login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :placeholder="config.form.passwordPlaceholder"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              :aria-pressed="showPassword"
              @click="togglePasswordVisibility"
            >
              <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye']" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div class="form-check mb-4">
          <input
            id="erp-remember-session"
            v-model="rememberSession"
            type="checkbox"
            class="form-check-input"
          />
          <label for="erp-remember-session" class="form-check-label small text-muted">
            {{ config.form.rememberLabel }}
          </label>
        </div>

        <div
          v-if="errorMessage"
          class="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2"
          role="alert"
        >
          <i class="bi bi-exclamation-triangle-fill flex-shrink-0" aria-hidden="true"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
          :disabled="isSubmitting"
        >
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm"
            aria-hidden="true"
          ></span>
          <i v-else class="bi bi-arrow-right-circle" aria-hidden="true"></i>
          <span>{{ isSubmitting ? config.form.submittingText : config.form.submitText }}</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useLogin } from "../composables/useLogin";

const router = useRouter();
const {
  config,
  email,
  password,
  showPassword,
  rememberSession,
  isSubmitting,
  errorMessage,
  togglePasswordVisibility,
  handleLogin,
} = useLogin(router);
</script>