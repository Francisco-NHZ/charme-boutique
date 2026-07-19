/* ========================================
   1. SELECIONANDO ELEMENTOS
======================================== */

// Header: controla a visibilidade ao rolar a página
const header = document.querySelector("header");
const menuToggle = document.querySelector(".menu-toggle");
const searchToggle = document.querySelector(".search-toggle");
const mainNav = document.querySelector(".main-nav");
let lastScrollTop = 0;

// Premium: cria uma barra de progresso no topo da página
const scrollProgress = document.createElement("div");
scrollProgress.id = "scroll-progress";
document.body.prepend(scrollProgress);

// Newsletter: pega o formulário, o campo de e-mail e a área de mensagem
const newsletterForm = document.querySelector("#newsletter-form");
const newsletterEmail = document.querySelector("#newsletter-email");
const newsletterMessage = document.querySelector("#newsletter-message");

// Busca: pega o formulário de busca, o campo de texto, os cards e a mensagem de status
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#site-search");
const productCards = Array.from(document.querySelectorAll(".product-card"));
const searchStatus = document.querySelector("#search-status");

// Modal: pega o container do modal, imagem, título, descrição, preço e botões de fechar
const modal = document.querySelector("#product-modal");
const modalImage = document.querySelector("#modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalDescription = document.querySelector("#modal-description");
const modalPrice = document.querySelector("#modal-price");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const modalBuyButtons = document.querySelectorAll(".modal-buy-btn");

/* ========================================
   2. FUNÇÕES DO HEADER
======================================== */

function toggleHeaderOnScroll() {
    if (!header) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 80) {
        header.classList.add("is-hidden");
    } else {
        header.classList.remove("is-hidden");
    }

    lastScrollTop = scrollTop;
}

function updateScrollProgress() {
    if (!scrollProgress) return;

    const scrollTop = window.scrollY;
    const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = maxHeight > 0 ? (scrollTop / maxHeight) * 100 : 0;

    scrollProgress.style.width = `${percentage}%`;
}

function updateActiveNavLink() {
    const links = document.querySelectorAll("header nav a");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        const isHome = currentPage === "index.html" || currentPage === "";

        if ((isHome && href.includes("index.html")) || href.includes(currentPage)) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function updateCurrentYear() {
    const yearElement = document.querySelector("#current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function closeMobileHeader() {
    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
    }

    if (searchToggle) {
        searchToggle.setAttribute("aria-expanded", "false");
    }

    if (mainNav) {
        mainNav.classList.remove("is-open");
    }

    if (searchForm) {
        searchForm.classList.remove("is-open");
    }
}

function setupHeaderMobileControls() {
    if (!menuToggle || !searchToggle || !mainNav || !searchForm) return;

    menuToggle.addEventListener("click", function () {
        const isOpen = mainNav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));

        if (isOpen) {
            searchForm.classList.remove("is-open");
            searchToggle.setAttribute("aria-expanded", "false");
        }
    });

    searchToggle.addEventListener("click", function () {
        const isOpen = searchForm.classList.toggle("is-open");
        searchToggle.setAttribute("aria-expanded", String(isOpen));

        if (isOpen) {
            mainNav.classList.add("is-open");
            menuToggle.setAttribute("aria-expanded", "true");
            searchInput?.focus();
        } else {
            mainNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });

    document.querySelectorAll("header .main-nav a").forEach((link) => {
        link.addEventListener("click", function () {
            if (window.innerWidth <= 700) {
                closeMobileHeader();
            }
        });
    });

    document.addEventListener("click", function (event) {
        if (window.innerWidth <= 700 && !event.target.closest("header")) {
            closeMobileHeader();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 700) {
            closeMobileHeader();
        }
    });
}

function setupScrollReveal() {
    const revealElements = document.querySelectorAll(
        ".hero, .categories, .featured-products, .contact, .page-card, .page-actions, .product-card, .category-card, .contact-newsletter, .contact-info"
    );

    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach((element, index) => {
        element.classList.add("reveal");
        element.style.transitionDelay = `${index * 60}ms`;
        observer.observe(element);
    });
}

window.addEventListener("scroll", function () {
    toggleHeaderOnScroll();
    updateScrollProgress();
});

/* ========================================
   4. FUNÇÕES DA NEWSLETTER
======================================== */

// Função para mostrar mensagens de feedback na newsletter
// Ela recebe a mensagem e o tipo (sucesso ou erro) e atualiza o HTML
function showNewsletterMessage(message, type) {
    if (!newsletterMessage) return;

    newsletterMessage.textContent = message;
    newsletterMessage.className = `form-message ${type}`;
}

/* ========================================
   4. EVENTOS DA NEWSLETTER
======================================== */

if (newsletterForm && newsletterEmail) {
    // Quando o formulário for enviado, executa esta função
    newsletterForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o recarregamento da página

        // Pega o e-mail digitado e remove espaços extras
        const email = newsletterEmail.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Valida o formato do e-mail com uma regra simples
        if (!emailPattern.test(email)) {
            showNewsletterMessage("Por favor, informe um e-mail válido.", "error");
            newsletterEmail.focus();
            return;
        }

        // Se estiver tudo certo, mostra sucesso e limpa o campo
        showNewsletterMessage("E-mail cadastrado com sucesso!", "success");
        newsletterForm.reset();
    });
}

/* ========================================
   5. FUNÇÕES DA BUSCA
======================================== */

// Função para filtrar os produtos conforme o texto digitado
// Ela percorre todos os cards e mostra apenas os que combinam com a busca
function filterProducts(term) {
    if (!productCards.length) return;

    let visibleCount = 0;

    productCards.forEach((card) => {
        // Junta nome, categoria e descrição em uma única string para comparar
        const searchableText = [
            card.dataset.name || "",
            card.dataset.category || "",
            card.dataset.description || ""
        ].join(" ").toLowerCase();

        const hasMatch = searchableText.includes(term);
        card.classList.toggle("is-hidden", !hasMatch);

        if (hasMatch) {
            visibleCount += 1;
        }
    });

    if (searchStatus) {
        if (!term) {
            searchStatus.textContent = "Use a busca para encontrar produtos por nome ou categoria.";
            return;
        }

        if (visibleCount > 0) {
            searchStatus.textContent = `Mostrando ${visibleCount} produto(s) para "${term}".`;
        } else {
            searchStatus.textContent = `Nenhum produto encontrado para "${term}".`;
        }
    }
}

/* ========================================
   6. EVENTOS DA BUSCA
======================================== */

if (searchForm && searchInput) {
    // Quando o formulário for enviado, filtra os produtos
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        filterProducts(searchInput.value.trim().toLowerCase());
    });

    // Também filtra enquanto a pessoa digita
    searchInput.addEventListener("input", function () {
        filterProducts(searchInput.value.trim().toLowerCase());
    });
}

/* ========================================
   7. FUNÇÕES DO MODAL
======================================== */

// Abre o modal com as informações do produto clicado
// O código pega os dados do card e coloca no modal
function openProductModal(productCard) {
    if (!modal || !modalImage || !modalTitle || !modalDescription || !modalPrice) return;

    const title = productCard.dataset.name || productCard.querySelector("h4").textContent;
    const description = productCard.dataset.description || "Produto exclusivo da coleção Charmê Boutique.";
    const price = productCard.dataset.price || productCard.querySelector(".price").textContent;
    const image = productCard.dataset.image || productCard.querySelector("img").src;

    modalImage.src = image;
    modalImage.alt = title;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalPrice.textContent = price;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

// Fecha o modal e volta a permitir rolar a página
function closeProductModal() {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

/* ========================================
   8. EVENTOS DO MODAL
======================================== */

// Quando clicar em "Comprar", abre o modal do produto
document.querySelectorAll(".product-buy-btn").forEach((button) => {
    button.addEventListener("click", function (event) {
        event.stopPropagation();

        const productCard = button.closest(".product-card");
        if (productCard) {
            openProductModal(productCard);
        }
    });
});

// Fecha o modal ao clicar no X, no fundo escuro ou no botão interno de compra
closeModalButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
        event.stopPropagation();
        closeProductModal();
    });
});

modalBuyButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
        event.stopPropagation();
        closeProductModal();
    });
});

if (modal) {
    // Se clicar fora do conteúdo do modal, fecha
    modal.addEventListener("click", function (event) {
        if (event.target === modal || event.target.classList.contains("modal-backdrop")) {
            closeProductModal();
        }
    });
}

// Fecha o modal ao apertar Esc
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeProductModal();
    }
});

/* ========================================
   9. INICIALIZAÇÃO
======================================== */

// Exibe os produtos inicialmente ao carregar a página
filterProducts("");
updateCurrentYear();
updateActiveNavLink();
updateScrollProgress();
setupHeaderMobileControls();
setupScrollReveal();