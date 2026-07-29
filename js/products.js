/* ====================================================================
   products.js — delegação de eventos de clique nos cards de produto
   (abrir modal / adicionar ao carrinho)
==================================================================== */
import { openProductModal } from "./modal.js";

export function setupProductCardEvents(onAddToCart) {
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
      if (card) onAddToCart(card);
    }
  });
}
