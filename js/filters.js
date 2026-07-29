/* ====================================================================
   filters.js — busca por texto + filtro por categoria (produtos.html
   e index.html)
   ---------------------------------------------------------------
   CORREÇÃO IMPORTANTE (ver REVIEW.md, bug #1): produtos.html tinha
   DOIS elementos com id="site-search" (um no header, outro no
   catálogo). IDs duplicados são inválidos em HTML e faziam
   `document.querySelector("#site-search")` sempre pegar o primeiro,
   deixando a busca do catálogo morta. Agora o input do catálogo tem um
   id próprio (#catalog-search) e os dois campos ficam sincronizados:
   digitar em qualquer um filtra os produtos e atualiza o outro.
==================================================================== */
let currentCategory = "all";

const filterButtons = document.querySelectorAll(".filter-btn");
const searchStatus = document.querySelector("#search-status");
const searchInputs = Array.from(
  document.querySelectorAll("#site-search, #catalog-search")
);

export function filterProducts(term) {
  const cards = document.querySelectorAll(".product-card");
  if (!cards.length) return;

  const normalizedTerm = (term || "").toLowerCase().trim();
  let visibleCount = 0;

  cards.forEach((card) => {
    const text = [card.dataset.name, card.dataset.category, card.dataset.description]
      .join(" ")
      .toLowerCase();

    const matchesCategory = currentCategory === "all" || card.dataset.category === currentCategory;
    const matchesSearch = !normalizedTerm || text.includes(normalizedTerm);
    const visible = matchesCategory && matchesSearch;

    card.classList.toggle("is-hidden", !visible);
    if (visible) visibleCount += 1;
  });

  if (!searchStatus) return;

  if (!normalizedTerm && currentCategory === "all") {
    searchStatus.textContent = "Use a busca ou as categorias para encontrar produtos.";
  } else if (visibleCount > 0) {
    searchStatus.textContent = normalizedTerm
      ? `Mostrando ${visibleCount} produto(s) para "${term}".`
      : `Mostrando ${visibleCount} produto(s).`;
  } else {
    searchStatus.textContent = "Nenhum produto encontrado.";
  }
}

function syncSearchInputs(value, source) {
  searchInputs.forEach((input) => {
    if (input !== source) input.value = value;
  });
}

export function setupCategoryFilters() {
  if (!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = button.dataset.category || "all";
      const activeInput = searchInputs.find((input) => input === document.activeElement);
      filterProducts((activeInput || searchInputs[0])?.value || "");
    });
  });
}

export function setupSearch() {
  if (!searchInputs.length) return;

  searchInputs.forEach((input) => {
    input.addEventListener("input", () => {
      syncSearchInputs(input.value, input);
      filterProducts(input.value);
    });
  });

  // O <form class="search-form"> do header também pode ser enviado com
  // Enter — evita recarregar a página e só reaplica o filtro.
  document.querySelectorAll(".search-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("#site-search");
      filterProducts(input ? input.value : "");
    });
  });

  filterProducts("");
}
