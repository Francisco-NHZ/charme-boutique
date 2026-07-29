/* ====================================================================
   api.js
   ---------------------------------------------------------------
   ESTE ARQUIVO NÃO É USADO HOJE. É um rascunho pronto para quando o
   projeto ganhar um backend de verdade (Node/Express, Firebase,
   Supabase, etc — ver "Próximos passos sugeridos" no README).

   A ideia: quando FEATURE_FLAGS.USE_BACKEND (js/config.js) virar
   `true`, os módulos de negócio (cart.js, auth.js, checkout.js) devem
   chamar as funções daqui em vez de js/storage.js. A assinatura das
   funções foi pensada para ficar parecida com storage.js
   (loadCart/persistCart, getUsers/saveUsers...), então trocar uma pela
   outra deve exigir o mínimo de mudança possível no resto do app.

   Protões já pensadas para quando isso for implementado de verdade:
   - Timeout de requisição via AbortController (uma API fora do ar não
     pode travar a UI para sempre).
   - Cabeçalho de CSRF token em métodos que alteram dado (POST/PUT/DELETE).
   - `credentials: "include"` só se a API usar cookies de sessão — do
     contrário, prefira Authorization: Bearer <token>.
   - Nunca logar dados sensíveis (senha, número de cartão) no console,
     nem em caso de erro.
   - Sempre validar a resposta antes de usar (a API pode mudar, cair,
     ou devolver um erro em formato inesperado).
==================================================================== */

import { APP_CONFIG } from "./config.js";

// Wrapper de fetch com timeout e tratamento de erro padronizado.
// Use isso em vez de `fetch()` cru quando o backend existir.
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        // CSRF: se o backend usar sessão por cookie, um token de CSRF
        // deve viajar aqui (ex.: lido de um <meta> injetado pelo
        // servidor no HTML, nunca gerado só no front-end).
        // "X-CSRF-Token": getCsrfTokenFromMeta(),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      // Não expõe detalhes internos do erro ao usuário final — só loga
      // para depuração e devolve uma mensagem genérica e segura.
      console.error(`API respondeu ${response.status} em ${path}`);
      throw new Error("Não foi possível completar a operação. Tente novamente.");
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("A operação demorou demais e foi cancelada. Verifique sua conexão.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* --------------------------------------------------------------
   Exemplos de como cada função ficaria (COMENTADOS DE PROPÓSITO —
   descomente e implemente quando o backend existir).
-------------------------------------------------------------- */

// export async function fetchCart() {
//   return apiFetch("/cart", { method: "GET" });
// }

// export async function submitOrder(order) {
//   return apiFetch("/orders", { method: "POST", body: JSON.stringify(order) });
// }

// export async function registerUser({ name, email, password }) {
//   // A senha viaja em texto puro só até o HTTPS terminar no servidor —
//   // é o BACKEND que deve fazer o hash (bcrypt/argon2) antes de salvar,
//   // nunca o front-end sozinho (aqui o hash local existe só como
//   // exercício didático de "defesa em profundidade").
//   return apiFetch("/auth/register", {
//     method: "POST",
//     body: JSON.stringify({ name, email, password }),
//   });
// }

// export async function loginUser({ email, password }) {
//   return apiFetch("/auth/login", {
//     method: "POST",
//     body: JSON.stringify({ email, password }),
//   });
// }

export { apiFetch };
