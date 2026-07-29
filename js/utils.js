/* ====================================================================
   utils.js — funções puras de formatação, escape e validação simples.
   "Puras" aqui significa: não tocam no DOM além de setFieldError (que
   é só um helper de UI), não têm efeitos colaterais escondidos e são
   fáceis de testar isoladamente (ver TESTS.md).
==================================================================== */

export function parsePrice(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  return Number(cleaned) || 0;
}

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Escapa HTML antes de inserir textos "dinâmicos" via innerHTML.
// Protege contra XSS básico caso algum dado (nome de produto, item do
// carrinho, nome de cliente etc.) venha a conter caracteres como < > " '.
// Isso importa MUITO mais quando um backend real entrar em cena: dados
// vindos de fora (API, outro usuário) nunca devem ser confiados.
export function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

export function isValidEmail(email) {
  // Regex simples e suficiente para validação de FORMATO no front-end.
  // A validação "de verdade" (e-mail existe? está confirmado?) é sempre
  // responsabilidade do backend.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

// Mostra/limpa mensagem de erro abaixo de um campo de formulário.
// Convenção usada neste projeto: cada <input id="x"> tem um
// <p class="field-error" id="x-error"> logo depois dele.
export function setFieldError(input, message) {
  if (!input) return;
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
  const errorEl = document.querySelector(`#${input.id}-error`);
  if (errorEl) errorEl.textContent = message || "";
}

export function clearFieldError(input) {
  setFieldError(input, "");
}
