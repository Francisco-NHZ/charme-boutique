/* ====================================================================
   auth.js — login / cadastro (100% local, simulado) e reflexo da
   sessão no header. Só executa em login.html (e reflectLoggedInUser
   roda em qualquer página, pois o header aparece em todas).
   ---------------------------------------------------------------
   AVISO PARA QUEM ESTUDAR ESTE CÓDIGO: isso é uma simulação client-side
   para fins didáticos. Um backend real nunca deve confiar em nada que
   vem do navegador — toda validação daqui precisa ser repetida no
   servidor.
==================================================================== */
import { isValidEmail, setFieldError, clearFieldError } from "./utils.js";
import { generateSalt, hashPassword } from "./security.js";
import {
  getUsers,
  saveUsers,
  getLoginAttempts,
  saveLoginAttempts,
  saveSession,
  getSession,
} from "./storage.js";
import { APP_CONFIG } from "./config.js";

// Regra de senha: mínimo 8 caracteres, pelo menos 1 letra e 1 número.
function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password || "");
}

// Calcula a "força" da senha (0 a 4) só para dar feedback visual ao usuário.
function calculatePasswordStrength(password) {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function setupPasswordToggle() {
  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      button.setAttribute("aria-label", isPassword ? "Ocultar senha" : "Mostrar senha");
      button.textContent = isPassword ? "🙈" : "👁️";
    });
  });
}

export function setupAuthTabs() {
  const tabLogin = document.querySelector("#tab-login");
  const tabRegister = document.querySelector("#tab-register");
  const loginForm = document.querySelector("#login-form");
  const registerForm = document.querySelector("#register-form");
  if (!tabLogin || !tabRegister || !loginForm || !registerForm) return;

  function activate(tab) {
    const isLogin = tab === "login";
    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
    tabLogin.setAttribute("aria-selected", String(isLogin));
    tabRegister.setAttribute("aria-selected", String(!isLogin));
    loginForm.classList.toggle("is-hidden", !isLogin);
    registerForm.classList.toggle("is-hidden", isLogin);
  }

  tabLogin.addEventListener("click", () => activate("login"));
  tabRegister.addEventListener("click", () => activate("register"));
}

export function setupRegisterForm() {
  const form = document.querySelector("#register-form");
  if (!form) return;

  const nameInput = document.querySelector("#register-name");
  const emailInput = document.querySelector("#register-email");
  const passwordInput = document.querySelector("#register-password");
  const confirmInput = document.querySelector("#register-confirm");
  const strengthMeter = document.querySelector("#register-strength");
  const strengthLabel = document.querySelector("#register-strength-label");
  const message = document.querySelector("#register-message");

  if (passwordInput && strengthMeter) {
    passwordInput.addEventListener("input", () => {
      const score = calculatePasswordStrength(passwordInput.value);
      strengthMeter.className = `strength-meter level-${score}`;
      const labels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
      if (strengthLabel) strengthLabel.textContent = passwordInput.value ? labels[score] : "";
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (message) message.textContent = "";

    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) return;

    let hasError = false;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (name.length < 2) {
      setFieldError(nameInput, "Informe seu nome completo.");
      hasError = true;
    } else {
      clearFieldError(nameInput);
    }

    if (!isValidEmail(email)) {
      setFieldError(emailInput, "E-mail inválido.");
      hasError = true;
    } else if (getUsers().some((user) => user.email === email)) {
      setFieldError(emailInput, "Já existe uma conta com este e-mail.");
      hasError = true;
    } else {
      clearFieldError(emailInput);
    }

    if (!isValidPassword(password)) {
      setFieldError(passwordInput, "Mínimo de 8 caracteres, com letras e números.");
      hasError = true;
    } else {
      clearFieldError(passwordInput);
    }

    if (confirm !== password) {
      setFieldError(confirmInput, "As senhas não coincidem.");
      hasError = true;
    } else {
      clearFieldError(confirmInput);
    }

    if (hasError) return;

    // Gera salt + hash — nunca guardamos a senha em texto puro.
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const users = getUsers();
    users.push({ name, email, salt, passwordHash, createdAt: new Date().toISOString() });
    saveUsers(users);

    form.reset();
    if (strengthMeter) strengthMeter.className = "strength-meter";
    if (strengthLabel) strengthLabel.textContent = "";

    if (message) {
      message.textContent = "Conta criada com sucesso! Você já pode entrar.";
      message.className = "form-message success";
    }

    // Leva o usuário para a aba de login automaticamente.
    document.querySelector("#tab-login")?.click();
    const loginEmail = document.querySelector("#login-email");
    if (loginEmail) loginEmail.value = email;
  });
}

export function setupLoginForm() {
  const form = document.querySelector("#login-form");
  if (!form) return;

  const emailInput = document.querySelector("#login-email");
  const passwordInput = document.querySelector("#login-password");
  const message = document.querySelector("#login-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (message) message.textContent = "";

    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) return;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    let hasError = false;
    if (!isValidEmail(email)) {
      setFieldError(emailInput, "E-mail inválido.");
      hasError = true;
    } else {
      clearFieldError(emailInput);
    }
    if (!password) {
      setFieldError(passwordInput, "Informe sua senha.");
      hasError = true;
    } else {
      clearFieldError(passwordInput);
    }
    if (hasError) return;

    // --- Proteção simples contra força bruta (rate limiting local) ---
    const attempts = getLoginAttempts(email);
    const now = Date.now();
    if (attempts.lockUntil && now < attempts.lockUntil) {
      const secondsLeft = Math.ceil((attempts.lockUntil - now) / 1000);
      if (message) {
        message.textContent = `Muitas tentativas. Tente novamente em ${secondsLeft}s.`;
        message.className = "form-message error";
      }
      return;
    }

    const users = getUsers();
    const user = users.find((entry) => entry.email === email);
    const computedHash = user ? await hashPassword(password, user.salt) : null;

    if (!user || computedHash !== user.passwordHash) {
      const newCount = (attempts.count || 0) + 1;
      const locked = newCount >= APP_CONFIG.LOGIN.MAX_ATTEMPTS;
      saveLoginAttempts(email, {
        count: locked ? 0 : newCount,
        lockUntil: locked ? now + APP_CONFIG.LOGIN.LOCK_DURATION_MS : 0,
      });

      if (message) {
        message.textContent = locked
          ? `Muitas tentativas erradas. Aguarde ${APP_CONFIG.LOGIN.LOCK_DURATION_MS / 1000} segundos.`
          : "E-mail ou senha incorretos.";
        message.className = "form-message error";
      }
      return;
    }

    // Sucesso: zera tentativas e cria sessão.
    saveLoginAttempts(email, { count: 0, lockUntil: 0 });
    saveSession({ name: user.name, email: user.email });

    if (message) {
      message.textContent = `Bem-vinda(o) de volta, ${user.name.split(" ")[0]}! Redirecionando...`;
      message.className = "form-message success";
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 900);
  });
}

// Mostra "Olá, Nome" no lugar do link de login se houver sessão ativa.
export function reflectLoggedInUser() {
  const loginLink = document.querySelector('.main-nav a[href="login.html"]');
  if (!loginLink) return;

  const session = getSession();
  if (session?.name) {
    loginLink.textContent = `Olá, ${session.name.split(" ")[0]}`;
  }
}
