// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../login/views/LoginView.vue";
import HomeErpView from "../modules/views/HomeErpView.vue";


function hasValidSessionToken() {
  if (typeof window === "undefined") return false;
  return Boolean(
    localStorage.getItem("erp_ia_token") ||
      localStorage.getItem("erp_jwt_token") ||
      sessionStorage.getItem("erp_ia_token")
  );
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/home",
      name: "home",
      component: HomeErpView,
      meta: { requiresAuth: true },
    },
    {
      path: "/cadastros/clientes",
      name: "clientes",
      component: HomeErpView,
      meta: { requiresAuth: true },
    },
    {
      path: "/cadastros/estados",
      name: "estados",
      component: HomeErpView,
      meta: { requiresAuth: true },
    },
    {
      path: "/cadastros/cidades",
      name: "cidades",
      component: HomeErpView,
      meta: { requiresAuth: true },
    },
    {
      path: "/cadastros/bairros",
      name: "bairros",
      component: HomeErpView,
      meta: { requiresAuth: true },
    },
    {
      path: "/cadastros/tipos-pagamento",
      name: "tipos-pagamento",
      component: HomeErpView,
      meta: { requiresAuth: true },
    },
    {
  path: "/cadastros/perfis-cliente",
  name: "perfis-cliente",
  component: HomeErpView,
  meta: { requiresAuth: true },
  },
  {
  path: "/cadastros/tipos-operacao",
  name: "tipos-operacao",
  component: HomeErpView,
  meta: { requiresAuth: true },
},
{
  path: "/cadastros/relatorios/clientes",
  name: "relatorio-clientes",
  component: HomeErpView,
  meta: { requiresAuth: true },
}
  ],
});

router.beforeEach((to) => {
  const isLoggedIn = hasValidSessionToken();

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: "login" };
  }

  if (to.name === "login" && isLoggedIn) {
    return { name: "home" };
  }

  return true;
});

export default router;