// Filtro de produtos por nome, categoria ou descrição.

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#site-search");
const searchStatus = document.querySelector("#search-status");

export function filterProducts(term) {
  const cards = document.querySelectorAll(".product-card");
  if (!cards.length) return;

  const normalizedTerm = (term || "").toLowerCase().trim();
  let visibleCount = 0;

  cards.forEach((card) => {
    const text = [card.dataset.name, card.dataset.category, card.dataset.description]
      .join(" ")
      .toLowerCase();

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

export function setupSearch() {
  if (!searchForm || !searchInput) return;

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterProducts(searchInput.value);
  });

  searchInput.addEventListener("input", () => filterProducts(searchInput.value));

  filterProducts("");
}
