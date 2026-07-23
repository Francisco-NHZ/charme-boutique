// Funções utilitárias usadas em vários módulos do site.

export const CART_KEY = "cart";

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
