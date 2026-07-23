// Tudo relacionado ao carrinho: estado em memória, localStorage e a
// renderização da página carrinho.html.

import { CART_KEY, parsePrice, formatCurrency } from "./utils.js";

const cartCounter = document.querySelector("#cart-counter");
const cartItemsContainer = document.querySelector("#cart-items");
const cartTotalElement = document.querySelector("#cart-total");
const clearCartButton = document.querySelector("#clear-cart");
const checkoutLink = document.querySelector("#checkout-link");

// Estado do carrinho em memória (sincronizado com o localStorage).
export let cart = [];

function getCartFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCounter();
}

export function updateCartCounter() {
  if (!cartCounter) return;
  const totalItems = cart.reduce((sum, item) => sum + (item.quantidade || 0), 0);

  if (cartCounter.tagName === "SPAN") {
    cartCounter.textContent = totalItems;
  } else {
    cartCounter.textContent = `🛒 Carrinho (${totalItems})`;
  }
}

export function addToCartCard(card) {
  if (!card?.dataset?.id) return;

  const productId = card.dataset.id;
  const existingItem = cart.find((item) => item.id === productId);
  const price = parsePrice(card.dataset.price);

  if (existingItem) {
    existingItem.quantidade = (existingItem.quantidade || 0) + 1;
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
}

export function addToCartById(productId) {
  const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (productCard) {
    addToCartCard(productCard);
  }
}

function calculateCartTotal() {
  return cart.reduce(
    (sum, item) => sum + parsePrice(item.preco) * (item.quantidade || 0),
    0
  );
}

function setCartItemQuantity(productId, quantity) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.quantidade = Math.max(1, Number(quantity) || 1);
  saveCart();
  renderCartPage();
}

function removeCartItem(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCartPage();
}

export function renderCartPage() {
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

  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
      <article class="cart-item">
        <img src="${item.imagem}" alt="${item.nome}" />
        <div class="cart-item-info">
          <h2>${item.nome}</h2>
          <p class="item-price">${formatCurrency(parsePrice(item.preco))}</p>
          <label>
            Quantidade
            <input
              type="number"
              min="1"
              value="${item.quantidade}"
              data-id="${item.id}"
              class="cart-item-qty"
            />
          </label>
          <p class="item-subtotal">${formatCurrency(parsePrice(item.preco) * item.quantidade)}</p>
          <button type="button" class="btn cart-item-remove" data-id="${item.id}">
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
    const productId = button.dataset.id;
    removeCartItem(productId);
  });

  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      cart = [];
      saveCart();
      renderCartPage();
    });
  }
}

// Ponto de entrada: carrega o carrinho salvo e prepara a página.
export function initCart() {
  cart = getCartFromStorage();
  updateCartCounter();
  renderCartPage();
  setupCartPageEvents();
}
