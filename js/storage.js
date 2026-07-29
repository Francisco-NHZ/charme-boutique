/* ====================================================================
   storage.js
   ---------------------------------------------------------------
   ÚNICO arquivo do projeto que lê/escreve em localStorage e
   sessionStorage diretamente. Essa é a peça central do plano de
   "preparar para um backend futuro": qualquer outro módulo (cart.js,
   auth.js, checkout.js) chama as funções daqui, e nunca
   localStorage.setItem/getItem diretamente. No dia em que existir uma
   API real, é este arquivo (e só ele) que muda — o resto do app nem
   precisa saber que a fonte de dados trocou.

   Todo acesso é protegido com try/catch: dado corrompido no
   localStorage (por exemplo, editado manualmente no DevTools) não pode
   derrubar a aplicação inteira. Ver REVIEW.md, bug #4.
==================================================================== */

const CART_KEY = "cart";
const USERS_KEY = "charme_users";
const ORDERS_KEY = "charme_orders";
const SESSION_KEY = "charme_session";
const LOGIN_ATTEMPTS_PREFIX = "charme_login_attempts_";

function safeGetJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Pode falhar por quota excedida (localStorage cheio) ou modo
    // privado em alguns navegadores. Falha "silenciosa" aqui é
    // proposital: melhor a UI continuar funcionando do que travar.
    console.error("Não foi possível salvar dados localmente:", error);
    return false;
  }
}

/* ---------------- Carrinho ---------------- */
export function loadCart() {
  const parsed = safeGetJSON(CART_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function persistCart(cart) {
  return safeSetJSON(CART_KEY, cart);
}

/* ---------------- Usuários (cadastro/login simulados) ---------------- */
export function getUsers() {
  const parsed = safeGetJSON(USERS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveUsers(users) {
  return safeSetJSON(USERS_KEY, users);
}

/* ---------------- Rate limiting de login ---------------- */
export function getLoginAttempts(email) {
  return safeGetJSON(LOGIN_ATTEMPTS_PREFIX + email, { count: 0, lockUntil: 0 });
}

export function saveLoginAttempts(email, data) {
  return safeSetJSON(LOGIN_ATTEMPTS_PREFIX + email, data);
}

/* ---------------- Sessão do usuário logado ---------------- */
export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar a sessão:", error);
    return false;
  }
}

/* ---------------- Pedidos (checkout) ---------------- */
export function getOrders() {
  const parsed = safeGetJSON(ORDERS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveOrder(order) {
  const orders = getOrders();
  orders.push(order);
  return safeSetJSON(ORDERS_KEY, orders);
}
