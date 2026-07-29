/* ====================================================================
   newsletter.js — formulário de assinatura da newsletter (index.html)
==================================================================== */
import { isValidEmail } from "./utils.js";

export function setupNewsletter() {
  const newsletterForm = document.querySelector("#newsletter-form");
  const newsletterEmail = document.querySelector("#newsletter-email");
  const newsletterMessage = document.querySelector("#newsletter-message");
  if (!newsletterForm || !newsletterEmail || !newsletterMessage) return;

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Honeypot anti-bot: campo escondido via CSS que só um robô preencheria.
    const honeypot = newsletterForm.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      newsletterForm.reset();
      return;
    }

    const email = newsletterEmail.value.trim();

    if (!isValidEmail(email)) {
      newsletterMessage.textContent = "Por favor, informe um e-mail válido.";
      newsletterMessage.className = "form-message error";
      newsletterEmail.focus();
      return;
    }

    // TODO(backend): quando existir uma API, trocar por algo como
    // await apiFetch("/newsletter", { method: "POST", body: JSON.stringify({ email }) })
    newsletterMessage.textContent = "E-mail cadastrado com sucesso!";
    newsletterMessage.className = "form-message success";
    newsletterForm.reset();
  });
}
