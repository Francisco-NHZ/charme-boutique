/* ====================================================================
   header.js — menu mobile, busca (toggle mobile), scroll reveal,
   barra de progresso de scroll, header some ao rolar, ano automático
   no rodapé, e destaque do link ativo na navegação.
==================================================================== */
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const searchToggle = document.querySelector(".search-toggle");
const mainNav = document.querySelector(".main-nav");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#site-search");
const currentYearElement = document.querySelector("#current-year");

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

export function setupScrollReveal() {
  const revealElements = document.querySelectorAll(
    ".hero, .categories, .featured-products, .contact, .product-card, .category-card, .contact-newsletter, .about-block, .about-stat"
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

export function updateCurrentYear() {
  if (!currentYearElement) return;
  currentYearElement.textContent = new Date().getFullYear();
}

export function setupScrollEffects() {
  window.addEventListener("scroll", () => {
    toggleHeaderOnScroll();
    updateScrollProgress();
  });
}
