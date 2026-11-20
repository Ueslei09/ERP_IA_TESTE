import { ref, computed } from "vue";
import { loginServiceConfig, loginRequest } from "../services/loginService";

// Estado compartilhado entre LoginView, LoginBrandBanner e LoginFormCard
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberSession = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref("");
const mediaFailed = ref(false);
const authenticatedUser = ref(null);

const parallaxX = ref(0);
const parallaxY = ref(0);
const prefersReducedMotion = ref(false);

export function useLogin(router = null) {
  const config = loginServiceConfig;

  const activeMedia = computed(() => {
    const raw = config.brand.media;
    const allowedTypes = ["image", "video", "text"];
    const type = allowedTypes.includes(raw.type) ? raw.type : "text";

    if (type !== "text" && (!raw.src || mediaFailed.value)) {
      return { ...raw, type: "text" };
    }

    return { ...raw, type };
  });

  const parallaxStyle = computed(() => {
    if (!config.parallax.enabled || prefersReducedMotion.value) {
      return { transform: "translate3d(0, 0, 0)" };
    }
    return {
      transform: `translate3d(${parallaxX.value}px, ${parallaxY.value}px, 0)`,
    };
  });

  const updateMotionPreference = () => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  };

  const handlePointerMove = (event) => {
    if (!config.parallax.enabled || prefersReducedMotion.value || typeof window === "undefined") {
      return;
    }
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    const normX = (event.clientX / width - 0.5) * 2;
    const normY = (event.clientY / height - 0.5) * 2;
    const strength = config.parallax.strength;

    parallaxX.value = Number((-normX * strength).toFixed(2));
    parallaxY.value = Number((-normY * strength).toFixed(2));
  };

  const handleScrollParallax = () => {
    if (!config.parallax.enabled || prefersReducedMotion.value || typeof window === "undefined") {
      return;
    }
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const strength = config.parallax.strength;
    parallaxY.value = Number((Math.sin(scrollY * 0.006) * (strength * 0.6)).toFixed(2));
  };

  const initParallax = () => {
    updateMotionPreference();
    if (typeof window !== "undefined") {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("scroll", handleScrollParallax, { passive: true });
      window.addEventListener("resize", updateMotionPreference, { passive: true });
    }
  };

  const destroyParallax = () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScrollParallax);
      window.removeEventListener("resize", updateMotionPreference);
    }
  };

  const markMediaFailed = () => {
    mediaFailed.value = true;
  };

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };

  const handleLogin = async () => {
    errorMessage.value = "";
    isSubmitting.value = true;

    try {
      const session = await loginRequest({
        email: email.value,
        password: password.value,
      });

      authenticatedUser.value = session.user;

      if (session.token && rememberSession.value && typeof localStorage !== "undefined") {
        localStorage.setItem("erp_ia_token", session.token);
      }

      // Se estiver usando Vue Router, redireciona para a rota principal
      if (router && typeof router.push === "function") {
        await router.push({ name: "home" });
      }
    } catch (err) {
      errorMessage.value = err?.message || "Falha ao autenticar usuário.";
    } finally {
      isSubmitting.value = false;
    }
  };

  const logout = async () => {
    authenticatedUser.value = null;
    password.value = "";
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("erp_ia_token");
    }
    if (router && typeof router.push === "function") {
      await router.push({ name: "login" });
    }
  };

  return {
    config,
    email,
    password,
    showPassword,
    rememberSession,
    isSubmitting,
    errorMessage,
    authenticatedUser,
    activeMedia,
    parallaxStyle,
    initParallax,
    destroyParallax,
    markMediaFailed,
    togglePasswordVisibility,
    handleLogin,
    logout,
  };
}