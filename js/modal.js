// Abertura/fechamento do modal de produto e delegação de cliques
// nos botões dos cards ("Ver detalhes" / "Adicionar ao carrinho").

import { addToCartById, addToCartCard } from "./cart.js";

const modal = document.querySelector("#product-modal");
const modalImage = document.querySelector("#modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalDescription = document.querySelector("#modal-description");
const modalPrice = document.querySelector("#modal-price");
const modalCloseButtons = document.querySelectorAll("[data-close-modal]");
const modalAddCartButton = document.querySelector(".modal-add-cart-btn, .modal-buy-btn");

export function openProductModal(card) {
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

export function closeProductModal() {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

export function setupModalEvents() {
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
}

export function setupProductCardEvents() {
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
