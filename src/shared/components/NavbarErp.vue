<!-- src/shared/components/NavbarErp.vue -->
<template>
  <header
    class="navbar navbar-expand-lg navbar-dark shadow-sm py-2"
    :style="{ backgroundColor: config.layout.darkBgColor || '#0a192f' }"
  >
    <div :class="useFluidContainer ? 'container-fluid px-3 px-lg-4' : 'container'">
      <button
        class="navbar-toggler border-0 text-white"
        type="button"
        aria-label="Alternar navegação"
        :aria-expanded="isMobileOpen"
        @click="toggleMobileMenu"
      >
        <i :class="['bi', isMobileOpen ? 'bi-x-lg' : 'bi-list', 'fs-4']" aria-hidden="true"></i>
      </button>

      <button
        type="button"
        class="btn p-0 border-0 bg-transparent text-white d-inline-flex d-lg-none align-items-center gap-2"
        @click="navigateTo('/home')"
      >
        <img
          v-if="activeBrand.type === 'image'"
          :src="activeBrand.imageSrc"
          :alt="activeBrand.imageAlt || activeBrand.text || 'Logo'"
          :style="{ height: `${activeBrand.imageHeight || 32}px`, width: 'auto' }"
          @error="handleImageError"
        />
        <template v-else-if="activeBrand.type === 'icon'">
          <i :class="['bi', activeBrand.icon || 'bi-cpu-fill', 'fs-5']" aria-hidden="true"></i>
          <span class="fw-bold">{{ activeBrand.text }}</span>
        </template>
        <span v-else class="fw-bold fs-6 px-2 py-1 rounded border border-light border-opacity-25">
          {{ activeBrand.text }}
        </span>
      </button>

      <div :class="['collapse navbar-collapse', { show: isMobileOpen }]">
        <ul class="navbar-nav align-items-lg-center gap-lg-2 my-2 my-lg-0">
          <li
            v-for="item in config.items"
            :key="item.id"
            class="nav-item position-relative erp-nav-item"
          >
            <button
              type="button"
              class="nav-link btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 py-2 px-2 w-100 text-start"
              :aria-expanded="item.type === 'dropdown' ? openDropdownId === item.id : undefined"
              @click="onItemClick(item)"
            >
              <i v-if="item.icon" :class="['bi', item.icon]" aria-hidden="true"></i>
              <span>{{ item.label }}</span>
              <i
                v-if="item.type === 'dropdown'"
                :class="[
                  'bi',
                  openDropdownId === item.id ? 'bi-chevron-up' : 'bi-chevron-down',
                  'small ms-auto ms-lg-1',
                ]"
                aria-hidden="true"
              ></i>
            </button>

            <hr
              class="erp-nav-hr my-0 border-0"
              :class="{ 'is-active': openDropdownId === item.id }"
            />

            <!-- Dropdown com seções clicáveis (ex.: Pessoas / Estoque) -->
            <div
              v-if="item.type === 'dropdown' && openDropdownId === item.id"
              class="erp-dropdown-panel mt-1 rounded-3 shadow-lg p-3"
            >
              <div
                v-for="(menuGroup, idx) in item.menus || []"
                :key="menuGroup.id || idx"
                class="erp-menu-section"
                :class="{ 'mb-2': idx < (item.menus?.length || 0) - 1 }"
              >
                <button
                  type="button"
                  class="btn btn-sm w-100 d-flex align-items-center justify-content-between text-uppercase fw-semibold small text-light py-2 px-2 rounded erp-section-trigger"
                  :class="{ 'is-selected': activeSubmenuId === menuGroup.id }"
                  :aria-expanded="activeSubmenuId === menuGroup.id"
                  @click="selectSubmenu(menuGroup.id)"
                >
                  <span class="d-flex align-items-center gap-2">
                    <i v-if="menuGroup.icon" :class="['bi', menuGroup.icon, 'text-info']" aria-hidden="true"></i>
                    <span>{{ menuGroup.title }}</span>
                  </span>
                  <i
                    :class="[
                      'bi',
                      activeSubmenuId === menuGroup.id ? 'bi-chevron-up' : 'bi-chevron-down',
                      'small',
                    ]"
                    aria-hidden="true"
                  ></i>
                </button>

                <ul
                  v-if="activeSubmenuId === menuGroup.id"
                  class="list-unstyled mt-1 mb-2 ps-2 d-flex flex-column gap-1"
                >
                  <li v-for="routine in menuGroup.routines || []" :key="routine.to">
                    <button
                      type="button"
                      class="btn btn-sm w-100 text-start text-white d-flex align-items-center gap-2 py-2 px-2 rounded erp-routine-btn"
                      @click="navigateTo(routine.to)"
                    >
                      <i v-if="routine.icon" :class="['bi', routine.icon, 'text-info']" aria-hidden="true"></i>
                      <span>{{ routine.label }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>

        <button
          type="button"
          class="btn p-0 border-0 bg-transparent text-white d-none d-lg-inline-flex align-items-center gap-2 ms-lg-auto"
          @click="navigateTo('/home')"
        >
          <img
            v-if="activeBrand.type === 'image'"
            :src="activeBrand.imageSrc"
            :alt="activeBrand.imageAlt || activeBrand.text || 'Logo'"
            :style="{ height: `${activeBrand.imageHeight || 32}px`, width: 'auto' }"
            @error="handleImageError"
          />
          <template v-else-if="activeBrand.type === 'icon'">
            <span
              class="d-inline-flex align-items-center justify-content-center rounded bg-white bg-opacity-10"
              style="width: 34px; height: 34px;"
            >
              <i :class="['bi', activeBrand.icon || 'bi-cpu-fill', 'fs-6']" aria-hidden="true"></i>
            </span>
            <span class="fw-bold">{{ activeBrand.text }}</span>
          </template>
          <template v-else>
            <span class="fw-bold fs-6 px-2 py-1 rounded border border-light border-opacity-25">
              {{ activeBrand.text }}
            </span>
            <span v-if="activeBrand.subtext" class="small text-light text-opacity-75">
              {{ activeBrand.subtext }}
            </span>
          </template>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useNavbarErp } from "../composables/useNavbarErp";

const props = defineProps({
  fluid: {
    type: Boolean,
    default: null,
  },
});

const router = useRouter();
const {
  config,
  activeBrand,
  isMobileOpen,
  openDropdownId,
  activeSubmenuId,
  toggleMobileMenu,
  toggleDropdown,
  selectSubmenu,
  handleImageError,
  navigateTo,
  logout,
} = useNavbarErp(router);

const useFluidContainer = props.fluid !== null ? props.fluid : config.layout.fluid;

function onItemClick(item) {
  if (item.type === "dropdown") {
    toggleDropdown(item);
    return;
  }
  if (item.type === "logout") {
    logout();
    return;
  }
  if (item.to) {
    navigateTo(item.to);
  }
}
</script>

<style scoped>
.erp-nav-hr {
  height: 2px;
  width: 0;
  background-color: #ffffff;
  opacity: 0;
  transition: width 0.22s ease, opacity 0.22s ease;
}

.erp-nav-item:hover .erp-nav-hr,
.erp-nav-hr.is-active {
  width: 21px;
  opacity: 1;
}

.erp-dropdown-panel {
  background-color: #0f2747;
  border: 1px solid rgba(255, 255, 255, 0.14);
  min-width: 255px;
  z-index: 1050;
}

@media (min-width: 992px) {
  .erp-dropdown-panel {
    position: absolute;
    top: 100%;
    left: 0;
  }
}

.erp-section-trigger:hover,
.erp-section-trigger.is-selected {
  background-color: rgba(255, 255, 255, 0.1);
}

.erp-routine-btn:hover {
  background-color: rgba(255, 255, 255, 0.14);
}
</style>