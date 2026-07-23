// Ponto de entrada do site. Este é o único arquivo JS referenciado
// diretamente no HTML (via <script type="module" src="js/main.js">).
// Cada funcionalidade vive no seu próprio módulo — aqui só conectamos tudo.

import { initCart } from "./cart.js";
import { setupModalEvents, setupProductCardEvents } from "./modal.js";
import { setupSearch } from "./search.js";
import {
  setupHeaderControls,
  updateActiveNavLink,
  toggleHeaderOnScroll,
  updateScrollProgress,
} from "./header.js";
import { setupNewsletter } from "./newsletter.js";
import { setupScrollReveal } from "./scrollReveal.js";

function updateCurrentYear() {
  const currentYearElement = document.querySelector("#current-year");
  if (!currentYearElement) return;
  currentYearElement.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  initCart();
  setupHeaderControls();
  setupScrollReveal();
  setupNewsletter();
  updateActiveNavLink();
  updateScrollProgress();
  updateCurrentYear();
  setupProductCardEvents();
  setupModalEvents();
  setupSearch();
});

window.addEventListener("scroll", () => {
  toggleHeaderOnScroll();
  updateScrollProgress();
});
