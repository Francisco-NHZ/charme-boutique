/* ====================================================================
   config.js
   ---------------------------------------------------------------
   Configuração central do site. Nenhuma lógica de negócio aqui — só
   valores que outros módulos leem. Isso existe para o dia em que este
   projeto ganhar um backend de verdade: em vez de caçar
   "localStorage.setItem" espalhado pelo código, muda-se só o que está
   aqui e em js/api.js.
==================================================================== */

export const APP_CONFIG = {
  // Quando existir uma API real, essa é a base de todas as chamadas.
  // Ex.: "https://api.charmeboutique.com.br/v1"
  API_BASE_URL: "",

  // Tempo limite (ms) para qualquer chamada de rede futura, evitando
  // que uma requisição trave a UI indefinidamente.
  REQUEST_TIMEOUT_MS: 10000,

  // Regras de negócio que hoje vivem só no front-end, mas que também
  // precisarão ser aplicadas no backend quando ele existir (nunca
  // confie só na validação do navegador).
  CART: {
    MAX_ITEM_QUANTITY: 99,
  },
  LOGIN: {
    MAX_ATTEMPTS: 5,
    LOCK_DURATION_MS: 30000,
  },
};

/* Feature flags — liga/desliga comportamento sem precisar reescrever
   os módulos que consomem os dados. Hoje só existe o modo local
   (localStorage). Quando o backend estiver pronto:
     1) implemente as funções reais em js/api.js
     2) mude USE_BACKEND para true
     3) js/storage.js passa a delegar para js/api.js nesse caso
        (o ponto de troca já está comentado lá) */
export const FEATURE_FLAGS = {
  USE_BACKEND: false,
};
