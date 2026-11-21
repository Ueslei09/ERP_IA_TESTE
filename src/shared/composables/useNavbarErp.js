// src/shared/composables/useNavbarErp.js
import { ref, computed } from "vue";
import { navbarErpConfig } from "../services/navbarErpService";

export function useNavbarErp(router = null) {
  const config = navbarErpConfig;

  const isMobileOpen = ref(false);
  const openDropdownId = ref(null);
  const activeSubmenuId = ref(null);
  const imageError = ref(false);

  const activeBrand = computed(() => {
    const brand = config.brand || {};
    const validTypes = ["image", "text", "icon"];
    const type = validTypes.includes(brand.type) ? brand.type : "text";

    if (type === "image" && (!brand.imageSrc || imageError.value)) {
      return { ...brand, type: "text" };
    }

    return { ...brand, type };
  });

  function toggleMobileMenu() {
    isMobileOpen.value = !isMobileOpen.value;
    if (!isMobileOpen.value) {
      openDropdownId.value = null;
      activeSubmenuId.value = null;
    }
  }

  function closeMenus() {
    isMobileOpen.value = false;
    openDropdownId.value = null;
    activeSubmenuId.value = null;
  }

  function toggleDropdown(item) {
    const isSame = openDropdownId.value === item.id;
    openDropdownId.value = isSame ? null : item.id;

    if (!isSame && Array.isArray(item.menus) && item.menus.length === 1) {
      activeSubmenuId.value = item.menus[0].id;
    } else if (isSame) {
      activeSubmenuId.value = null;
    } else {
      activeSubmenuId.value = null;
    }
  }

  function selectSubmenu(menuId) {
    activeSubmenuId.value = activeSubmenuId.value === menuId ? null : menuId;
  }

  function handleImageError() {
    imageError.value = true;
  }

  async function navigateTo(routePath) {
    if (!routePath) return;
    closeMenus();
    if (router && typeof router.push === "function") {
      await router.push(routePath);
    }
  }

  async function logout() {
    closeMenus();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("erp_ia_token");
      localStorage.removeItem("erp_jwt_token");
      localStorage.removeItem("erp_auth_user");
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("erp_ia_token");
    }
    if (router && typeof router.push === "function") {
      await router.push({ name: "login" });
    }
  }

  return {
    config,
    activeBrand,
    isMobileOpen,
    openDropdownId,
    activeSubmenuId,
    toggleMobileMenu,
    closeMenus,
    toggleDropdown,
    selectSubmenu,
    handleImageError,
    navigateTo,
    logout,
  };
}