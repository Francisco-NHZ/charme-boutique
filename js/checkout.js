/* ====================================================================
   checkout.js — validação de dados de entrega/pagamento e confirmação
   de pedido (checkout.html)
   ---------------------------------------------------------------
   Tudo aqui é validação de FORMATO no navegador (CPF, CEP, número de
   cartão via algoritmo de Luhn, validade, etc.). Isso melhora a
   experiência do usuário e evita erros óbvios, mas em um sistema real
   de pagamento é o gateway/backend (ex.: Stripe, Pagar.me, Cielo) que
   valida e processa o cartão de forma segura — o front-end de produção
   jamais deveria manipular ou armazenar dados completos de cartão.
==================================================================== */
import { escapeHTML, formatCurrency, parsePrice, isValidEmail, setFieldError, clearFieldError } from "./utils.js";
import { getCart, calculateCartTotal, onCartChange, clearCart } from "./cart.js";
import { saveOrder } from "./storage.js";

export function isValidCPF(rawCpf) {
  const cpf = String(rawCpf || "").replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) checkDigit1 = 0;
  if (checkDigit1 !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) checkDigit2 = 0;
  return checkDigit2 === Number(cpf[10]);
}

export function isValidCEP(cep) {
  return /^\d{5}-?\d{3}$/.test(String(cep || "").trim());
}

export function isValidPhone(phone) {
  return /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/.test(String(phone || "").trim());
}

// Algoritmo de Luhn — validação matemática de número de cartão (não
// verifica se o cartão existe/tem saldo, só se o número é "bem formado").
export function isValidCardNumber(rawNumber) {
  const digits = String(rawNumber || "").replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(expiry) {
  const match = String(expiry || "").trim().match(/^(0[1-9]|1[0-2])\/?(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function isValidCVV(cvv) {
  return /^\d{3,4}$/.test(String(cvv || "").trim());
}

function renderCheckoutSummary() {
  const itemsContainer = document.querySelector("#checkout-items");
  const totalElement = document.querySelector("#checkout-total");
  if (!itemsContainer || !totalElement) return;

  const cart = getCart();

  if (!cart.length) {
    itemsContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
    totalElement.textContent = formatCurrency(0);
    return;
  }

  itemsContainer.innerHTML = cart
    .map(
      (item) => `
      <div class="checkout-line">
        <span>${escapeHTML(item.nome)} × ${item.quantidade}</span>
        <strong>${formatCurrency(parsePrice(item.preco) * item.quantidade)}</strong>
      </div>
    `
    )
    .join("");

  totalElement.textContent = formatCurrency(calculateCartTotal());
}

function setupPaymentMethodToggle() {
  const options = document.querySelectorAll('input[name="payment-method"]');
  const cardFields = document.querySelector("#card-fields");
  if (!options.length) return;

  function refresh() {
    const selected = document.querySelector('input[name="payment-method"]:checked');
    document.querySelectorAll(".payment-option").forEach((el) => {
      el.classList.toggle("selected", el.querySelector('input[name="payment-method"]')?.checked);
    });
    if (cardFields) {
      cardFields.classList.toggle("is-hidden", selected?.value !== "cartao");
    }
  }

  options.forEach((option) => option.addEventListener("change", refresh));
  refresh();
}

// Aplica uma máscara simples (só visual) para o campo de cartão: 0000 0000 0000 0000
function setupCardNumberMask() {
  const cardInput = document.querySelector("#card-number");
  if (!cardInput) return;
  cardInput.addEventListener("input", () => {
    const digits = cardInput.value.replace(/\D/g, "").slice(0, 19);
    cardInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  });
}

export function setupCheckoutForm() {
  const form = document.querySelector("#checkout-form");
  if (!form) return;

  renderCheckoutSummary();
  // Se o carrinho mudar (ex.: usuário voltou e editou pelo carrinho em
  // outra aba), o resumo do checkout se atualiza sozinho.
  onCartChange(renderCheckoutSummary);

  setupPaymentMethodToggle();
  setupCardNumberMask();

  const fields = {
    name: document.querySelector("#checkout-name"),
    cpf: document.querySelector("#checkout-cpf"),
    email: document.querySelector("#checkout-email"),
    phone: document.querySelector("#checkout-phone"),
    cep: document.querySelector("#checkout-cep"),
    street: document.querySelector("#checkout-street"),
    number: document.querySelector("#checkout-number"),
    city: document.querySelector("#checkout-city"),
    state: document.querySelector("#checkout-state"),
  };

  const message = document.querySelector("#checkout-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (message) message.textContent = "";

    const cart = getCart();
    if (!cart.length) {
      if (message) {
        message.textContent = "Seu carrinho está vazio — adicione produtos antes de finalizar.";
        message.className = "form-message error";
      }
      return;
    }

    let hasError = false;
    const check = (input, valid, msg) => {
      if (!input) return;
      if (!valid) {
        setFieldError(input, msg);
        hasError = true;
      } else {
        clearFieldError(input);
      }
    };

    check(fields.name, fields.name.value.trim().length >= 3, "Informe seu nome completo.");
    check(fields.cpf, isValidCPF(fields.cpf.value), "CPF inválido.");
    check(fields.email, isValidEmail(fields.email.value), "E-mail inválido.");
    check(fields.phone, isValidPhone(fields.phone.value), "Telefone inválido. Ex: (62) 98218-9869");
    check(fields.cep, isValidCEP(fields.cep.value), "CEP inválido. Ex: 74000-000");
    check(fields.street, fields.street.value.trim().length >= 2, "Informe a rua.");
    check(fields.number, fields.number.value.trim().length >= 1, "Informe o número.");
    check(fields.city, fields.city.value.trim().length >= 2, "Informe a cidade.");
    check(fields.state, fields.state.value.trim().length === 2, "Use a sigla do estado (ex: GO).");

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    let cardLast4 = "";

    if (paymentMethod === "cartao") {
      const cardNumber = document.querySelector("#card-number");
      const cardName = document.querySelector("#card-name");
      const cardExpiry = document.querySelector("#card-expiry");
      const cardCvv = document.querySelector("#card-cvv");

      check(cardNumber, isValidCardNumber(cardNumber.value), "Número de cartão inválido.");
      check(cardName, cardName.value.trim().length >= 2, "Informe o nome impresso no cartão.");
      check(cardExpiry, isValidExpiry(cardExpiry.value), "Validade inválida (MM/AA).");
      check(cardCvv, isValidCVV(cardCvv.value), "CVV inválido.");

      if (isValidCardNumber(cardNumber.value)) {
        cardLast4 = cardNumber.value.replace(/\D/g, "").slice(-4);
      }
    }

    if (hasError) {
      if (message) {
        message.textContent = "Confira os campos destacados em vermelho.";
        message.className = "form-message error";
      }
      form.querySelector(".invalid")?.focus();
      return;
    }

    // --- "Processamento" do pedido (simulado) ---
    // TODO(backend): trocar por `await submitOrder(order)` de js/api.js
    // quando existir um gateway de pagamento real. O front-end NUNCA
    // deve ser responsável por "aprovar" um pagamento de verdade.
    const order = {
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`).slice(0, 8).toUpperCase(),
      date: new Date().toISOString(),
      items: cart,
      total: calculateCartTotal(),
      customer: { name: fields.name.value.trim(), email: fields.email.value.trim() },
      paymentMethod,
      cardLast4: cardLast4 || undefined,
    };

    saveOrder(order);

    // Limpa o carrinho após "pagamento" confirmado.
    clearCart();

    showOrderConfirmation(order);
  });
}

function showOrderConfirmation(order) {
  const formSection = document.querySelector("#checkout-form")?.closest("section");
  const summarySection = document.querySelector("#checkout-summary");
  const confirmationSection = document.querySelector("#order-confirmation");
  if (!confirmationSection) return;

  formSection?.classList.add("is-hidden");
  summarySection?.classList.add("is-hidden");
  confirmationSection.classList.remove("is-hidden");

  const orderIdEl = document.querySelector("#order-id");
  if (orderIdEl) orderIdEl.textContent = order.id;

  const finalSummary = document.querySelector("#order-summary-final");
  if (finalSummary) {
    const paymentLabel =
      { cartao: `Cartão de crédito (final ${order.cardLast4 || "----"})`, pix: "Pix", boleto: "Boleto" }[
        order.paymentMethod
      ] || order.paymentMethod;

    finalSummary.innerHTML = `
      <p>Pagamento: <strong>${escapeHTML(paymentLabel)}</strong></p>
      <p>Total: <strong>${formatCurrency(order.total)}</strong></p>
      <p>Um e-mail de confirmação seria enviado para <strong>${escapeHTML(order.customer.email)}</strong> em um cenário real.</p>
    `;
  }

  confirmationSection.scrollIntoView({ behavior: "smooth" });
}
