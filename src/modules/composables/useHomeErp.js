import { ref, computed } from "vue";
import { homeBackgroundConfig } from "../services/homeErpService";

export function useHomeErp(router = null) {
  const mediaFailed = ref(false);

  const backgroundConfig = computed(() => {
    const cfg = homeBackgroundConfig || {};
    const requestedType = cfg.type === "video" ? "video" : "image";

    if (requestedType === "video") {
      if (cfg.videoSrc && !mediaFailed.value) {
        return { ...cfg, activeType: "video" };
      }
      if (cfg.imageSrc) {
        return { ...cfg, activeType: "image" };
      }
      return { ...cfg, activeType: "fallback" };
    }

    if (cfg.imageSrc && !mediaFailed.value) {
      return { ...cfg, activeType: "image" };
    }

    return { ...cfg, activeType: "fallback" };
  });

  function handleMediaError() {
    mediaFailed.value = true;
  }

  async function logout() {
    localStorage.removeItem("erp_ia_token");
    localStorage.removeItem("erp_jwt_token");
    localStorage.removeItem("erp_auth_user");
    sessionStorage.removeItem("erp_ia_token");
    if (router?.push) {
      await router.push({ name: "login" });
    }
  }

  return {
    backgroundConfig,
    handleMediaError,
    logout,
  };
}