// Comportamento do cabeçalho: menu mobile, toggle de busca,
// destaque do link ativo, esconder header ao rolar e barra de progresso.

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const searchToggle = document.querySelector(".search-toggle");
const mainNav = document.querySelector(".main-nav");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#site-search");

export function updateActiveNavLink() {
  const links = document.querySelectorAll(".main-nav a");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle(
      "active",
      href === currentPage || (currentPage === "" && href === "index.html")
    );
  });
}

export function setupHeaderControls() {
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

export function toggleHeaderOnScroll() {
  if (!header) return;
  const currentScroll = window.scrollY || document.documentElement.scrollTop;
  header.classList.toggle("is-hidden", currentScroll > 100);
}

export function updateScrollProgress() {
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
