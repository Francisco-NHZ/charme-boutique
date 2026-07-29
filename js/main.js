/* ====================================================================
   CHARMÊ BOUTIQUE — main.js
   ---------------------------------------------------------------
   Este é o ÚNICO script que as páginas HTML carregam:
     <script type="module" src="js/main.js"></script>

   Ele importa cada módulo especializado e chama as funções de
   inicialização. Cada módulo, por sua vez, segue o mesmo princípio do
   projeto original: "se o elemento HTML que essa função precisa não
   existe nesta página, a função simplesmente não faz nada". É por
   isso que dá para carregar main.js em TODAS as páginas sem se
   preocupar em saber quais delas têm carrinho, checkout, ou login.

   Por que ES Modules (import/export) em vez de um <script> só?
   - Cada arquivo carrega e testa uma responsabilidade isolada.
   - Import explícito documenta as dependências entre os módulos
     (por exemplo, é fácil ver que checkout.js depende de cart.js).
   - É a forma moderna e nativa do navegador — sem precisar de um
     bundler/build step, mantendo a filosofia "sem build" do projeto.

   ⚠️ type="module" só funciona servido por http(s)://, não por
   file://. Use Live Server ou `python3 -m http.server` (ver README).
==================================================================== */

import { initCart, renderCartPage, setupCartPageEvents, addToCartCard, addToCartById } from "./cart.js";
import { setupProductModal } from "./modal.js";
import { setupProductCardEvents } from "./products.js";
import { setupCategoryFilters, setupSearch } from "./filters.js";
import {
  setupHeaderControls,
  setupScrollReveal,
  updateActiveNavLink,
  updateScrollProgress,
  updateCurrentYear,
  setupScrollEffects,
} from "./header.js";
import { setupNewsletter } from "./newsletter.js";
import {
  setupAuthTabs,
  setupPasswordToggle,
  setupRegisterForm,
  setupLoginForm,
  reflectLoggedInUser,
} from "./auth.js";
import { setupCheckoutForm } from "./checkout.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Estado / dados
  initCart();

  // 2. Carrinho (só age se os elementos existirem na página)
  renderCartPage();
  setupCartPageEvents();

  // 3. Cabeçalho, navegação e efeitos de rolagem
  setupHeaderControls();
  setupScrollReveal();
  updateActiveNavLink();
  updateScrollProgress();
  updateCurrentYear();
  setupScrollEffects();
  reflectLoggedInUser();

  // 4. Produtos: cards, modal, busca e filtro por categoria
  setupProductModal((id) => addToCartById(id));
  setupProductCardEvents((card) => addToCartCard(card));
  setupCategoryFilters();
  setupSearch();

  // 5. Newsletter (index.html)
  setupNewsletter();

  // 6. Login / cadastro (login.html)
  setupAuthTabs();
  setupPasswordToggle();
  setupRegisterForm();
  setupLoginForm();

  // 7. Checkout (checkout.html)
  setupCheckoutForm();
});
