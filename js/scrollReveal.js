// Anima elementos para aparecerem suavemente conforme entram na tela.

export function setupScrollReveal() {
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
