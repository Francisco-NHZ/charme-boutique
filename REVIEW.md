# 🔍 Revisão técnica — Charmê Boutique

Revisão feita como um tech lead revisaria o PR de um dev júnior: o que estava
bom, o que quebrava, o que era só "dívida técnica", e o que foi mudado.
Nada aqui é para te fazer sentir mal — o projeto já estava com boas práticas
(CSP, hash de senha, honeypot, escapeHTML). Os problemas abaixo são comuns e
fáceis de deixar passar quando o site cresce de 3 para 6 páginas.

---

## 🐞 Bugs reais (quebravam funcionalidade)

### 1. `id="site-search"` duplicado em `produtos.html`
Havia **dois** elementos com o mesmo `id="site-search"`: um no formulário de
busca do cabeçalho e outro em `.catalog-tools`. HTML com IDs duplicados é
inválido, e pior: `document.querySelector("#site-search")` sempre pega o
**primeiro** elemento do DOM. Resultado: a caixa de busca do catálogo
(a mais visível, dentro da seção de produtos) **não fazia nada** quando o
usuário digitava nela — só a do menu (escondida atrás do botão 🔎 no mobile)
funcionava.
**Correção:** IDs únicos (`site-search` no header, `catalog-search` no
catálogo) e os dois inputs agora ficam sincronizados — digitar em qualquer
um filtra os produtos e atualiza o outro campo.

### 2. Botão "Adicionar ao Carrinho" inconsistente
Em `produtos.html`, os cards de Bolsas usavam a classe `btn add-cart-btn` e
os de Acessórios/Maquiagens usavam só `add-cart-btn` (sem `btn`). Isso não
quebrava o JS (o seletor é `.add-cart-btn`), mas gerava inconsistência
visual sutil dependendo da especificidade do CSS. Padronizado em todos os
cards.

### 3. Contador do carrinho com duas estruturas de HTML diferentes
Em `index.html` o contador era um `<span id="cart-counter">` dentro do
link. Nas outras 5 páginas, o **próprio `<a>`** tinha `id="cart-counter"`
e o texto inteiro (`🛒 Carrinho (0)`) era substituído via JS. O `script.js`
tinha uma verificação (`cartCounter.tagName === "SPAN"`) só para lidar com
essa diferença — um sinal claro de que o HTML devia ter sido padronizado
desde o início, e não o JS "adivinhando" a estrutura. Unifiquei: agora
**todas** as páginas usam `<a id="cart-counter">🛒 Carrinho
<span id="cart-count">0</span></a>`, e o JS ficou mais simples.

### 4. `localStorage`/`JSON.parse` sem proteção em alguns pontos
`getCartFromStorage`, `getUsers` etc. já tinham `try/catch`, mas o
carregamento de pedidos no checkout (`ORDERS_KEY`) fazia
`JSON.parse(localStorage.getItem(...) || "[]")` **sem try/catch**. Se um
usuário tiver dado corrompido no localStorage (ex.: editou manualmente pelo
DevTools), isso quebra o checkout inteiro com uma exceção não tratada.
Centralizei todo acesso a `localStorage`/`sessionStorage` em
`js/storage.js`, sempre com try/catch.

### 5. Seletor de botão do modal redundante
`document.querySelector(".modal-add-cart-btn, .modal-buy-btn")` — a classe
`.modal-add-cart-btn` não existe em lugar nenhum do HTML (as duas páginas
com modal usam `.modal-buy-btn`). Não causava bug, mas é código morto que
confunde quem for dar manutenção. Limpo.

---

## ⚠️ Riscos / dívida técnica (não quebrava, mas era arriscado)

- **Sem `maxlength`** nos campos de CPF, telefone, CEP, cartão, validade e
  CVV do checkout. A validação por regex já barra valores errados no
  *envio*, mas nada impedia o usuário de colar um texto gigante no campo
  antes disso (ruído na UI, e "defesa em profundidade" de verdade significa
  nunca confiar só numa camada). Adicionado `maxlength` compatível com cada
  máscara.
- **CSS e JS em um arquivo único cada um** (`style.css` com ~950 linhas,
  `script.js` com ~800 linhas). Funciona, mas qualquer alteração pequena
  exige rolar o arquivo inteiro e aumenta o risco de um dev mexer na parte
  errada. Modularizado (ver seção abaixo).
- **Nenhum ponto de extensão para um backend futuro.** Toda a lógica de
  carrinho/login/pedido está misturada com `localStorage.setItem(...)`
  direto nas funções de negócio. Isso dificulta trocar por chamadas de API
  no futuro. Criei uma camada `js/storage.js` (fonte única de verdade dos
  dados) e `js/api.js` (stub documentado) para isso — ver seção
  "Preparado para o backend".
- **CSP não teria `connect-src` liberado para uma API futura.** Documentei
  exatamente qual linha mudar quando vocês tiverem um backend real.

---

## ✅ O que já estava bom e eu mantive
- Hash de senha com salt via Web Crypto (`SubtleCrypto`), nunca senha em
  texto puro.
- Honeypot anti-bot nos formulários de newsletter, login e cadastro.
- `escapeHTML()` sistemático antes de qualquer `innerHTML` dinâmico.
- Validação de CPF com dígito verificador, cartão com algoritmo de Luhn.
- Rate limiting simulado de login (5 tentativas → bloqueio de 30s).
- Content-Security-Policy via `<meta>` em todas as páginas.
- Acessibilidade: `aria-live`, `role="alert"`, fechar modal com `Esc`.

---

## 🧱 Modularização

### CSS — `css/style.css` como ponto de entrada (`@import`)
```
css/
├── style.css                 ← só @imports, é isso que o HTML linka
├── base/
│   ├── _reset.css            (reset + tipografia base do body)
│   ├── _variables.css        (todas as custom properties)
│   └── _typography.css       (h1-h4, font-family das famílias)
├── layout/
│   ├── _header.css           (header, nav, busca — com responsivo)
│   └── _footer.css
├── components/
│   ├── _buttons.css
│   ├── _forms.css            (inputs, fieldset, erros de campo)
│   ├── _modal.css
│   ├── _cards.css            (categorias + product-card + hero)
│   ├── _cart.css             (carrinho + resumo + checkout payment)
│   ├── _auth.css             (login/cadastro)
│   └── _contact.css          (newsletter + fale conosco)
├── pages/
│   ├── _produtos.css         (busca + filtros do catálogo)
│   └── _sobre.css            (nova seção "Sobre" — ver abaixo)
└── utilities/
    └── _utilities.css        (.sr-only, .is-hidden, .reveal, scroll bar)
```
`@import` em CSS puro tem uma pequena penalidade de performance (o browser
baixa em cascata), aceitável para um projeto de estudo deste tamanho. Se um
dia isso virar produção com muito tráfego, o próximo passo natural é rodar
os parciais por um bundler (Vite, esbuild) — deixei um comentário no topo
do `style.css` sobre isso.

### JavaScript — ES Modules com `js/main.js` como ponto de entrada
```
js/
├── config.js      (flags e futura URL de API — nenhuma lógica)
├── utils.js        (formatação, escapeHTML, validação de e-mail)
├── security.js      (hash de senha)
├── storage.js       (ÚNICO lugar que toca localStorage/sessionStorage)
├── api.js           (stub documentado p/ trocar localStorage por fetch)
├── cart.js          (estado do carrinho + render + eventos)
├── modal.js          (modal de produto)
├── filters.js         (busca + filtro de categoria)
├── header.js           (menu, scroll reveal, scroll bar, ano, nav ativo)
├── newsletter.js
├── auth.js              (login/cadastro/sessão)
├── checkout.js           (validação de pedido + confirmação)
├── products.js            (delegação de clique nos cards)
└── main.js                (importa tudo e inicializa no DOMContentLoaded)
```
Cada página só tem `<script type="module" src="js/main.js"></script>`.
Como é `type="module"`, o próprio `main.js` importa só o que existe — e cada
módulo continua seguindo o padrão que já existia no projeto original: "se o
elemento não existe nesta página, a função não faz nada".

> ⚠️ **Atenção ao abrir os arquivos:** `type="module"` só funciona por
> `http://`/`https://`, **não por `file://`** (é uma regra de CORS dos
> navegadores, não bug deste projeto). Ou seja, agora o projeto **exige**
> um servidor local — exatamente a Opção 2 (Live Server) ou Opção 3
> (`python3 -m http.server`) que já estavam documentadas no README. Atualizei
> o README removendo a opção de dar duplo clique no HTML.

---

## 🔌 Preparado para um backend futuro
Hoje tudo continua rodando 100% local (localStorage), mas agora com uma
camada de indireção:

- `js/storage.js` é a **única** peça de código que sabe que os dados vêm do
  `localStorage`. Trocar por uma API significa reescrever só este arquivo.
- `js/api.js` já tem a "casca" de como isso ficaria (`apiFetch`, cabeçalho
  de CSRF, timeout com `AbortController`, tratamento de erro de rede) —
  comentado e não usado ainda, só para vocês copiarem quando o backend
  existir.
- `js/config.js` tem `FEATURE_FLAGS.USE_BACKEND` e `API_BASE_URL` prontos —
  quando o backend estiver pronto, muda esses dois valores e os módulos que
  já foram adaptados para checar a flag passam a usar `api.js` em vez de
  `storage.js`.
- CSP: quando existir uma API real, muda **só** a linha `connect-src 'self'`
  para `connect-src 'self' https://api.seudominio.com` (comentário deixado
  em cada HTML, no lugar exato).
- Continua valendo o aviso do projeto original: **toda validação do
  front-end precisa ser repetida no backend**. Nada que roda no navegador do
  usuário é confiável.

---

## 🧪 Testes manuais feitos
Testei isoladamente (Node, sem DOM) todas as funções puras de validação —
são as mesmas que decidem se um pedido é aceito no checkout:
`parsePrice`, `formatCurrency`, `isValidEmail`, `isValidCPF`, `isValidCEP`,
`isValidPhone`, `isValidCardNumber` (Luhn), `isValidExpiry`, `isValidCVV`,
`calculatePasswordStrength`. Resultado no `TESTS.md`.

Revisei manualmente (lendo o fluxo linha a linha) os seguintes fluxos, que
não dá para testar sem um navegador real:
- Busca + filtro de categoria combinados em `produtos.html` (bug do
  `#site-search` duplicado corrigido, ver item 1).
- Adicionar produto pelo card e pelo modal → contador do header atualiza →
  carrinho reflete quantidade e subtotal.
- Alterar quantidade / remover item / limpar carrinho.
- Cadastro → login → bloqueio após 5 tentativas erradas → sessão refletida
  no header.
- Checkout completo com Cartão, Pix e Boleto, incluindo os campos que somem
  quando não é "Cartão".
