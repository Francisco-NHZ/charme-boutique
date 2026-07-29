/* ====================================================================
   cart.js — estado do carrinho, renderização e eventos da página
   /carrinho.html
   ---------------------------------------------------------------
   Este módulo é o "dono" do estado do carrinho em memória (a variável
   `cart` abaixo). Outros módulos (checkout.js, products.js, header.js)
   só devem ler/alterar o carrinho através das funções exportadas aqui
   — nunca mexendo direto no array. Isso garante que qualquer alteração
   sempre passe por saveCart() (que persiste e notifica quem estiver
   "ouvindo" a mudança, ex.: o contador do header).
==================================================================== */

import { parsePrice, formatCurrency, escapeHTML } from "./utils.js";
import { loadCart, persistCart } from "./storage.js";
import { APP_CONFIG } from "./config.js";

let cart = [];

// Pequeno "pub/sub": qualquer parte do app pode reagir a mudanças no
// carrinho sem precisar conhecer cart.js por dentro (ex.: o resumo do
// checkout, em checkout.js, se re-renderiza sozinho quando o carrinho
// muda).
const listeners = new Set();

export function onCartChange(callback) {
  listeners.add(callback);
}

function notifyChange() {
  listeners.forEach((callback) => callback(cart));
}

export function initCart() {
  cart = loadCart();
  return cart;
}

export function getCart() {
  return cart;
}

function saveCart() {
  persistCart(cart);
  notifyChange();
}

export function calculateCartTotal() {
  return cart.reduce((sum, item) => sum + parsePrice(item.preco) * (item.quantidade || 0), 0);
}

export function addToCartCard(card) {
  if (!card?.dataset?.id) return;

  const productId = card.dataset.id;
  const existingItem = cart.find((item) => item.id === productId);
  const price = parsePrice(card.dataset.price);

  if (existingItem) {
    existingItem.quantidade = Math.min(
      APP_CONFIG.CART.MAX_ITEM_QUANTITY,
      (existingItem.quantidade || 0) + 1
    );
  } else {
    cart.push({
      id: productId,
      nome: card.dataset.name || "",
      preco: price,
      imagem: card.dataset.image || "",
      quantidade: 1,
    });
  }

  saveCart();
  renderCartPage();
  showAddedToCartFeedback(card);
}

export function addToCartById(productId) {
  const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (productCard) addToCartCard(productCard);
}

// Pequeno feedback visual (não bloqueante) ao adicionar um item.
function showAddedToCartFeedback(card) {
  const button = card.querySelector(".add-cart-btn");
  if (!button) return;
  const original = button.textContent;
  button.textContent = "Adicionado ✓";
  button.disabled = true;
  setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 900);
}

export function setCartItemQuantity(productId, quantity) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  // Limita quantidade entre 1 e o máximo configurado, para evitar
  // valores absurdos digitados manualmente no campo.
  const safeQuantity = Math.min(
    APP_CONFIG.CART.MAX_ITEM_QUANTITY,
    Math.max(1, Number(quantity) || 1)
  );
  item.quantidade = safeQuantity;
  saveCart();
  renderCartPage();
}

export function removeCartItem(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCartPage();
}

export function clearCart() {
  cart = [];
  saveCart();
  renderCartPage();
}

/* ==================================================
   RENDERIZAÇÃO — só roda em páginas que têm os elementos abaixo
================================================== */
const cartCounterLink = document.querySelector("#cart-counter");
const cartCountBadge = document.querySelector("#cart-count");
const cartItemsContainer = document.querySelector("#cart-items");
const cartTotalElement = document.querySelector("#cart-total");
const clearCartButton = document.querySelector("#clear-cart");
const checkoutLink = document.querySelector("#checkout-link");

export function updateCartCounter() {
  if (!cartCountBadge) return;
  const totalItems = cart.reduce((sum, item) => sum + (item.quantidade || 0), 0);
  cartCountBadge.textContent = totalItems;
  if (cartCounterLink) {
    cartCounterLink.setAttribute("aria-label", `Carrinho, ${totalItems} item(ns)`);
  }
}

export function renderCartPage() {
  updateCartCounter();
  if (!cartItemsContainer) return;

  if (!cart.length) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <p>Seu carrinho está vazio.</p>
        <a href="produtos.html" class="btn primary">Ver produtos</a>
      </div>
    `;
    if (cartTotalElement) cartTotalElement.textContent = "R$ 0,00";
    if (checkoutLink) {
      checkoutLink.classList.add("disabled");
      checkoutLink.setAttribute("aria-disabled", "true");
    }
    return;
  }

  if (checkoutLink) {
    checkoutLink.classList.remove("disabled");
    checkoutLink.removeAttribute("aria-disabled");
  }

  // Observação de segurança: escapeHTML() em tudo que veio de "fora"
  // (mesmo que hoje só venha de data-attributes do próprio site) para
  // manter o hábito de nunca confiar cegamente em string interpolada
  // dentro de innerHTML — importante especialmente quando um backend
  // real passar a alimentar esses dados.
  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
      <article class="cart-item">
        <img src="${escapeHTML(item.imagem)}" alt="${escapeHTML(item.nome)}" />
        <div class="cart-item-info">
          <h2>${escapeHTML(item.nome)}</h2>
          <p class="item-price">${formatCurrency(parsePrice(item.preco))}</p>
          <label>
            Quantidade
            <input
              type="number"
              min="1"
              max="${APP_CONFIG.CART.MAX_ITEM_QUANTITY}"
              value="${item.quantidade}"
              data-id="${escapeHTML(item.id)}"
              class="cart-item-qty"
            />
          </label>
          <p class="item-subtotal">${formatCurrency(parsePrice(item.preco) * item.quantidade)}</p>
          <button type="button" class="btn cart-item-remove" data-id="${escapeHTML(item.id)}">
            Remover
          </button>
        </div>
      </article>
    `
    )
    .join("");

  if (cartTotalElement) {
    cartTotalElement.textContent = formatCurrency(calculateCartTotal());
  }
}

export function setupCartPageEvents() {
  if (!cartItemsContainer) return;

  cartItemsContainer.addEventListener("input", (event) => {
    if (!event.target.matches(".cart-item-qty")) return;
    const productId = event.target.dataset.id;
    setCartItemQuantity(productId, event.target.value);
  });

  cartItemsContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".cart-item-remove");
    if (!button) return;
    removeCartItem(button.dataset.id);
  });

  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      if (!cart.length) return;
      const confirmClear = confirm("Tem certeza que deseja esvaziar o carrinho?");
      if (!confirmClear) return;
      clearCart();
    });
  }
}
