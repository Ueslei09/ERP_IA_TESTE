// src/shared/services/navbarErpService.js
export const navbarErpConfig = {
  brand: {
    type: "text", // "image" | "text" | "icon"
    text: "ERP IA",
    subtext: "Multitenant",
    icon: "bi-cpu-fill",
    imageSrc: "",
    imageAlt: "Logo do sistema ERP",
    imageHeight: 32,
  },
  layout: {
    fluid: true,
    darkBgColor: "#0a192f",
    hoverLineWidthPx: 21,
  },
  items: [
    {
      id: "cadastros-gerais",
      label: "Cadastros Gerais",
      icon: "bi-folder2-open",
      type: "dropdown",
      menus: [
        {
          id: "pessoas",
          title: "Pessoas",
          icon: "bi-people",
          routines: [
            { label: "Cadastro de Clientes", to: "/cadastros/clientes", icon: "bi-person-check" },
            { label: "Cadastro de Lojas", to: "/cadastros/lojas", icon: "bi-shop" },
            { label: "Usuários", to: "/cadastros/usuarios", icon: "bi-person-gear" },
            { label: "Funcionários", to: "/cadastros/funcionarios", icon: "bi-person-badge" },
            {
              label: "Relatórios de Clientes",
              to: "/cadastros/relatorios/clientes",
              icon: "bi-file-earmark-bar-graph",
            },
          ],
        },
        {
          id: "relatorio-gerais-pessoas",
          title: "Relatório Gerais",
          icon: "bi-clipboard-data",
          routines: [
            {
              label: "Relatórios de Clientes",
              to: "/cadastros/relatorios/clientes",
              icon: "bi-file-earmark-bar-graph",
            },
          ],
        },
        {
          id: "controles",
          title: "Controles",
          icon: "bi-sliders",
          routines: [
            { label: "Estados (UF / ICMS / DIFAL)", to: "/cadastros/estados", icon: "bi-map" },
            { label: "Cadastro de Cidades", to: "/cadastros/cidades", icon: "bi-building" },
            { label: "Cadastro de Bairros", to: "/cadastros/bairros", icon: "bi-geo-alt" },
            { label: "Tipos de Pagamento", to: "/cadastros/tipos-pagamento", icon: "bi-credit-card" },
            { label: "Perfil de Clientes", to: "/cadastros/perfis-cliente", icon: "bi-person-vcard" },
            { label: "Tipos de Operação", to: "/cadastros/tipos-operacao", icon: "bi-diagram-3" },
            { label: "Cadastro de Departamentos", to: "/cadastros/departamentos", icon: "bi-diagram-2",},
            {label: "Cadastro de Funcionários",to: "/cadastros/funcionarios",icon: "bi-person-badge",},
          ],
        },
        {
          id: "estoque",
          title: "Estoque",
          icon: "bi-box-seam",
          routines: [
            { label: "Cadastro de Produtos", to: "/estoque/produtos", icon: "bi-upc-scan" },
            { label: "Saldos e Almoxarifado", to: "/estoque/saldos", icon: "bi-boxes" },
            { label: "Movimentações", to: "/estoque/movimentacoes", icon: "bi-arrow-left-right" },
            { label: "Inventário", to: "/estoque/inventario", icon: "bi-clipboard-check" },
          ],
        },
      ],
    },
    {
      id: "financeiro",
      label: "Financeiro",
      icon: "bi-cash-stack",
      type: "dropdown",
      menus: [
        {
          id: "rotinas-financeiras",
          title: "Rotinas Financeiras",
          icon: "bi-wallet2",
          routines: [
            { label: "Cadastro de Bancos", to: "/financeiro/bancos", icon: "bi-bank" },
            { label: "Contas", to: "/financeiro/contas", icon: "bi-credit-card-2-front" },
            { label: "A Pagar", to: "/financeiro/a-pagar", icon: "bi-arrow-up-right-circle" },
            { label: "Contas a Receber", to: "/financeiro/contas-a-receber", icon: "bi-arrow-down-left-circle" },
          ],
        },
      ],
    },
    {
      id: "comercial",
      label: "Comercial",
      icon: "bi-bag-check",
      type: "dropdown",
      menus: [
        {
          id: "operacao-comercial",
          title: "Operação Comercial",
          icon: "bi-receipt",
          routines: [
            { label: "Vendas / Orçamento", to: "/comercial/vendas-orcamento", icon: "bi-file-earmark-text" },
            { label: "Emitir Notas", to: "/comercial/emitir-notas", icon: "bi-receipt-cutoff" },
            { label: "PDV", to: "/comercial/pdv", icon: "bi-pc-display" },
            { label: "Entradas de Notas", to: "/comercial/entradas-notas", icon: "bi-box-arrow-in-down" },
            { label: "Saídas de Notas", to: "/comercial/saidas-notas", icon: "bi-box-arrow-up" },
          ],
        },
      ],
    },
    {
      id: "relatorios",
      label: "Relatórios",
      icon: "bi-bar-chart-line",
      type: "dropdown",
      menus: [
        {
          id: "indicadores-extratos",
          title: "Indicadores e Extratos",
          icon: "bi-graph-up",
          routines: [
            { label: "Comissões", to: "/relatorios/comissoes", icon: "bi-percent" },
            { label: "Vendas", to: "/relatorios/vendas", icon: "bi-currency-dollar" },
          ],
        },
      ],
    },
    {
      id: "ajuda",
      label: "Ajuda",
      icon: "bi-question-circle",
      type: "link",
      to: "/ajuda",
    },
    {
      id: "sair",
      label: "Sair",
      icon: "bi-box-arrow-right",
      type: "logout",
    },
  ],
};