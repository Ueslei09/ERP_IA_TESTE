const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const loginServiceConfig = {
  brand: {
    badgeText: "ERP IA Teste",
    badgeIcon: "bi-cpu-fill",
    // Opções: "image" | "video" | "text"
    media: {
      type: "text",
      src: "",
      poster: "",
      alt: "Painel visual do sistema ERP IA Teste com integração de banco de dados e inteligência artificial",
      title: "ERP IA Teste",
      subtitle: "Gestão empresarial conectada ao seu banco de dados com assistente de Inteligência Artificial.",
    },
    highlights: [
      { icon: "bi-database-check", label: "Integrado ao Banco" },
      { icon: "bi-phone", label: "Mobile First" },
      { icon: "bi-robot", label: "Assistente IA" },
    ],
  },
  form: {
    headerIcon: "bi-shield-lock-fill",
    title: "Acesso ao Sistema",
    subtitle: "Informe suas credenciais para acessar o painel principal.",
    emailLabel: "E-mail corporativo",
    emailPlaceholder: "usuario@empresa.com",
    passwordLabel: "Senha",
    passwordPlaceholder: "Digite sua senha",
    rememberLabel: "Manter sessão ativa",
    submitText: "Entrar no sistema",
    submittingText: "Autenticando...",
  },
  parallax: {
    enabled: true,
    strength: 12,
  },
};

export async function loginRequest({ email, password }) {
  const cleanEmail = (email || "").trim();
  const cleanPassword = password || "";

  if (!cleanEmail || !cleanPassword) {
    throw new Error("Preencha o e-mail e a senha para continuar.");
  }

  // Quando o backend estiver conectado via VITE_API_URL
  if (API_BASE_URL) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || "E-mail ou senha inválidos.");
    }

    return {
      token: data?.token || null,
      user: data?.user || { email: cleanEmail },
    };
  }

  // Simulação local enquanto o backend não está conectado
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    token: "dev-session-token",
    user: { email: cleanEmail },
  };
}