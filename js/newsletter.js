// Validação e feedback do formulário de newsletter.

const newsletterForm = document.querySelector("#newsletter-form");
const newsletterEmail = document.querySelector("#newsletter-email");
const newsletterMessage = document.querySelector("#newsletter-message");

export function setupNewsletter() {
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
