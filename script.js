/* ==================================================
   1. SELEÇÃO DE ELEMENTOS
================================================== */
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const searchToggle = document.querySelector(".search-toggle");
const mainNav = document.querySelector(".main-nav");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#site-search");
const searchStatus = document.querySelector("#search-status");
const newsletterForm = document.querySelector("#newsletter-form");
const newsletterEmail = document.querySelector("#newsletter-email");
const newsletterMessage = document.querySelector("#newsletter-message");

const modal = document.querySelector("#product-modal");
const modalImage = document.querySelector("#modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalDescription = document.querySelector("#modal-description");
const modalPrice = document.querySelector("#modal-price");
const modalCloseButtons = document.querySelectorAll("[data-close-modal]");
const modalAddCartButton = document.querySelector(".modal-add-cart-btn, .modal-buy-btn");

const cartCounter = document.querySelector("#cart-counter");
const currentYearElement = document.querySelector("#current-year");
const cartItemsContainer = document.querySelector("#cart-items");
const cartTotalElement = document.querySelector("#cart-total");
const clearCartButton = document.querySelector("#clear-cart");
const checkoutLink = document.querySelector("#checkout-link");

const CART_KEY = "cart";
let cart = [];

/* ==================================================
   2. UTILITÁRIOS
================================================== */
function parsePrice(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  return Number(cleaned) || 0;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getCartFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCounter();
}

/* ==================================================
   3. CARRINHO
================================================== */
function updateCartCounter() {
  if (!cartCounter) return;
  const totalItems = cart.reduce((sum, item) => sum + (item.quantidade || 0), 0);

  if (cartCounter.tagName === "SPAN") {
    cartCounter.textContent = totalItems;
  } else {
    cartCounter.textContent = `🛒 Carrinho (${totalItems})`;
  }
}

function addToCartCard(card) {
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
      quantidade: 1
    });
  }

  saveCart();
}

function addToCartById(productId) {
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

function renderCartPage() {
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
    .map((item) => `
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
    `)
    .join("");

  if (cartTotalElement) {
    cartTotalElement.textContent = formatCurrency(calculateCartTotal());
  }
}

function setupCartPageEvents() {
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

/* ==================================================
   4. MODAL DE PRODUTO
================================================== */
function openProductModal(card) {
  if (!modal || !card) return;

  modalImage.src = card.dataset.image || "";
  modalImage.alt = card.dataset.name || "";
  modalTitle.textContent = card.dataset.name || "";
  modalDescription.textContent = card.dataset.description || "";
  modalPrice.textContent = card.dataset.price || "";

  if (modalAddCartButton) {
    modalAddCartButton.dataset.id = card.dataset.id || "";
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ==================================================
   5. FILTRAGEM
================================================== */
function filterProducts(term) {
  const cards = document.querySelectorAll(".product-card");
  if (!cards.length) return;

  const normalizedTerm = (term || "").toLowerCase().trim();
  let visibleCount = 0;

  cards.forEach((card) => {
    const text = [
      card.dataset.name,
      card.dataset.category,
      card.dataset.description
    ].join(" ").toLowerCase();

    const visible = !normalizedTerm || text.includes(normalizedTerm);
    card.classList.toggle("is-hidden", !visible);
    if (visible) visibleCount += 1;
  });

  if (!searchStatus) return;

  if (!normalizedTerm) {
    searchStatus.textContent = "Use a busca para encontrar produtos por nome ou categoria.";
  } else if (visibleCount > 0) {
    searchStatus.textContent = `Mostrando ${visibleCount} produto(s) para "${term}".`;
  } else {
    searchStatus.textContent = `Nenhum produto encontrado para "${term}".`;
  }
}

/* ==================================================
   6. SCROLL REVEAL
================================================== */
function setupScrollReveal() {
  const revealElements = document.querySelectorAll(
    ".hero, .categories, .featured-products, .contact, .product-card, .category-card, .contact-newsletter"
  );

  if (!revealElements.length) return;

  revealElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(24px)";
    element.style.transition = "opacity 0.7s ease, transform 0.7s ease";
  });

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        target.style.opacity = "1";
        target.style.transform = "translateY(0)";
        observerInstance.unobserve(target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
  );

  revealElements.forEach((element) => observer.observe(element));
}

/* ==================================================
   7. HEADER
================================================== */
function updateActiveNavLink() {
  const links = document.querySelectorAll(".main-nav a");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === currentPage || (currentPage === "" && href === "index.html"));
  });
}

function setupHeaderControls() {
  if (!menuToggle || !searchToggle || !mainNav || !searchForm) return;

  menuToggle.addEventListener("click", () => {
    const opened = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(opened));
    if (opened) {
      searchForm.classList.remove("is-open");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });

  searchToggle.addEventListener("click", () => {
    const opened = searchForm.classList.toggle("is-open");
    searchToggle.setAttribute("aria-expanded", String(opened));
    if (opened) {
      searchInput?.focus();
      mainNav.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
    }
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 700 && !event.target.closest(".site-header")) {
      mainNav.classList.remove("is-open");
      searchForm.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) {
      mainNav.classList.remove("is-open");
      searchForm.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ==================================================
   8. NEWSLETTER
================================================== */
function setupNewsletter() {
  if (!newsletterForm || !newsletterEmail || !newsletterMessage) return;

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = newsletterEmail.value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email)) {
      newsletterMessage.textContent = "Por favor, informe um e-mail válido.";
      newsletterMessage.className = "form-message error";
      newsletterEmail.focus();
      return;
    }

    newsletterMessage.textContent = "E-mail cadastrado com sucesso!";
    newsletterMessage.className = "form-message success";
    newsletterForm.reset();
  });
}

/* ==================================================
   9. ANO AUTOMÁTICO
================================================== */
function updateCurrentYear() {
  if (!currentYearElement) return;
  currentYearElement.textContent = new Date().getFullYear();
}

/* ==================================================
   10. SCROLL E PROGRESSO
================================================== */
function toggleHeaderOnScroll() {
  if (!header) return;
  const currentScroll = window.scrollY || document.documentElement.scrollTop;
  header.classList.toggle("is-hidden", currentScroll > 100);
}

function updateScrollProgress() {
  let progress = document.querySelector("#scroll-progress");
  if (!progress) {
    progress = document.createElement("div");
    progress.id = "scroll-progress";
    document.body.prepend(progress);
  }

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progress.style.width = `${percent}%`;
}

/* ==================================================
   11. EVENTOS DE PRODUTO
================================================== */
function setupProductCardEvents() {
  document.addEventListener("click", (event) => {
    const detailButton = event.target.closest(".product-details-btn");
    if (detailButton) {
      const card = detailButton.closest(".product-card");
      if (card) openProductModal(card);
      return;
    }

    const addButton = event.target.closest(".add-cart-btn");
    if (addButton) {
      const card = addButton.closest(".product-card");
      if (card) addToCartCard(card);
    }
  });
}

/* ==================================================
   12. INICIALIZAÇÃO
================================================== */
document.addEventListener("DOMContentLoaded", () => {
  cart = getCartFromStorage();
  updateCartCounter();
  renderCartPage();
  setupHeaderControls();
  setupScrollReveal();
  setupNewsletter();
  updateActiveNavLink();
  updateScrollProgress();
  updateCurrentYear();
  setupProductCardEvents();
  setupCartPageEvents();

  if (modalAddCartButton) {
    modalAddCartButton.addEventListener("click", () => {
      const id = modalAddCartButton.dataset.id;
      if (id) addToCartById(id);
      closeProductModal();
    });
  }

  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeProductModal);
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeProductModal();
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      filterProducts(searchInput.value);
    });
    searchInput.addEventListener("input", () => filterProducts(searchInput.value));
    filterProducts("");
  }
});

window.addEventListener("scroll", () => {
  toggleHeaderOnScroll();
  updateScrollProgress();
});

