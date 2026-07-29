/* ====================================================================
   security.js — hashing de senha (simulado, 100% no navegador)
   ---------------------------------------------------------------
   Usamos a Web Crypto API (SubtleCrypto) para nunca guardar a senha em
   texto puro no localStorage. Em produção isso deveria acontecer no
   servidor com algoritmos próprios para senha (bcrypt, argon2 — SHA-256
   puro NÃO é recomendado para senhas reais, pois é rápido demais e
   facilita ataques de força bruta). Aqui usamos SHA-256 + "salt" só
   para exemplificar o conceito de hashing de forma simples e didática.
==================================================================== */

export function generateSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(text) {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password, salt) {
  return sha256Hex(`${salt}:${password}`);
}
