/* ====================================================================
   modal.js — modal de detalhes do produto (index.html e produtos.html)
==================================================================== */
const modal = document.querySelector("#product-modal");
const modalImage = document.querySelector("#modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalDescription = document.querySelector("#modal-description");
const modalPrice = document.querySelector("#modal-price");
const modalCloseButtons = document.querySelectorAll("[data-close-modal]");
// A classe real usada no HTML é .modal-buy-btn (o antigo
// ".modal-add-cart-btn, .modal-buy-btn" tinha um seletor morto que
// nunca existiu no HTML — limpo, ver REVIEW.md bug #5).
const modalAddCartButton = document.querySelector(".modal-buy-btn");

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

export function setupProductModal(onAddToCart) {
  if (!modal) return;

  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeProductModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeProductModal();
  });

  // Acessibilidade: fecha o modal com a tecla Esc.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeProductModal();
    }
  });

  if (modalAddCartButton) {
    modalAddCartButton.addEventListener("click", () => {
      const id = modalAddCartButton.dataset.id;
      if (id) onAddToCart(id);
      closeProductModal();
    });
  }
}
