# 🌸 Charmê Boutique

Projeto front-end (HTML + CSS + JavaScript puro, **sem frameworks e sem backend**) de uma loja virtual fictícia, com foco em identidade visual premium, boas práticas de front-end e um fluxo completo de compra (busca → carrinho → login/cadastro → checkout → confirmação) para fins de **estudo**.

> ⚠️ **Este projeto é 100% educacional.** Não há servidor, banco de dados real, nem processamento de pagamento de verdade. Tudo roda no seu navegador, usando `localStorage`/`sessionStorage`. Não use senhas ou dados reais ao testar.

---

## 🔍 Esta é uma revisão técnica do projeto original

Este pacote passou por uma revisão completa (bugs corrigidos, CSS e JS modularizados, conteúdo revisado). Se você já conhece a v1 do projeto, comece por aqui:

* **[`REVIEW.md`](./REVIEW.md)** — todos os bugs encontrados, por que aconteciam e como foram corrigidos (leitura recomendada antes de mexer no código).
* **[`TESTS.md`](./TESTS.md)** — os testes automatizados feitos nas funções de validação (CPF, cartão, e-mail...) e os fluxos testados manualmente.

---

## 🧱 Estrutura do projeto (modularizada)

```text
charme-boutique/
├── index.html
├── produtos.html
├── carrinho.html
├── checkout.html
├── login.html
├── sobre.html
├── css/
│   ├── style.css          ← ponto de entrada (@import de tudo abaixo)
│   ├── base/               (variáveis, reset, tipografia)
│   ├── layout/             (header, footer)
│   ├── components/         (botões, forms, modal, cards, carrinho,
│   │                          login/cadastro, contato)
│   ├── pages/              (estilos exclusivos de produtos e sobre)
│   └── utilities/          (classes utilitárias .is-hidden etc.)
├── js/
│   ├── main.js             ← ponto de entrada (importado por TODAS as
│   │                          páginas via <script type="module">)
│   ├── config.js            (configuração / feature flags)
│   ├── utils.js             (formatação, escape, validação simples)
│   ├── security.js          (hash de senha)
│   ├── storage.js           (ÚNICA camada que toca localStorage)
│   ├── api.js               (stub documentado p/ futuro backend)
│   ├── cart.js, modal.js, filters.js, products.js
│   ├── header.js, newsletter.js
│   ├── auth.js, checkout.js
├── assets/                 (imagens — ver assets/README.md)
├── REVIEW.md               (revisão técnica completa)
├── TESTS.md                (testes realizados)
└── .prettierrc
```

Veja o topo de `css/style.css` e `js/main.js` para uma explicação detalhada de por que cada pasta existe e em que ordem as coisas são carregadas.

---

## Como rodar localmente

O projeto **não usa build step** (sem npm install, sem bundler) — mas agora usa **ES Modules** (`import`/`export`) no JavaScript, o que exige servir os arquivos por `http://`, e não mais abrindo direto (`file://`). Isso é uma regra de segurança dos navegadores (CORS para módulos), não uma limitação deste projeto.

**Opção 1 — Live Server (recomendado):**

1. Instale a extensão *Live Server* no VS Code.
2. Clique com o botão direito em `index.html` → **"Open with Live Server"**.

**Opção 2 — servidor HTTP simples (Python), via terminal:**

```bash
cd charme-boutique
python3 -m http.server 5500
# depois acesse http://localhost:5500
```

**Opção 3 — qualquer outro servidor estático** (ex.: `npx serve`, extensão do navegador, etc.) também funciona, desde que sirva a pasta raiz do projeto.

---

## Como testar cada funcionalidade

### Busca e filtro de produtos

1. Abra `produtos.html`.
2. Digite um termo na busca do catálogo ou na busca do cabeçalho — ambas ficam sincronizadas agora (ver `REVIEW.md`, bug #1).
3. Clique numa categoria (ex.: "Acessórios") — busca e categoria se combinam.

### Carrinho

1. Em qualquer produto, clique em **"Adicionar ao carrinho"** ou abra o modal ("Ver detalhes") e adicione por lá.
2. Veja o contador do carrinho mudar no cabeçalho (agora idêntico em todas as páginas).
3. Abra `carrinho.html`: altere quantidades, remova itens, ou use "Limpar carrinho" (pede confirmação).

### Cadastro e login

1. Abra `login.html`, aba **"Criar conta"**.
2. Preencha nome, e-mail e uma senha com 8+ caracteres, letras e números.
3. Envie — você será levado para a aba "Entrar" com o e-mail preenchido.
4. Faça login. Erre a senha 5 vezes seguidas para ver o bloqueio de 30s.
5. Após logar com sucesso, o link "Login" no menu vira "Olá, `Nome`".

### Checkout (fluxo completo)

1. Adicione produtos ao carrinho e vá em **"Finalizar compra"**.
2. Preencha os dados pessoais e endereço.
3. Escolha uma forma de pagamento:

   * **Cartão**: use um número válido pelo algoritmo de Luhn, por exemplo `4111 1111 1111 1111` (número clássico de teste, sem ligação com conta real), validade futura (ex.: `12/29`) e CVV de 3 dígitos.
   * **Pix** ou **Boleto**: não pedem dados de cartão.
4. Envie o formulário. Você verá a tela de confirmação com número do pedido, e o carrinho será esvaziado automaticamente.

---

## Arquitetura de segurança (resumo para estudo)

Como é uma aplicação estática, as medidas de segurança implementadas neste projeto têm finalidade **educacional e demonstrativa**. Elas ajudam a praticar conceitos importantes de segurança no desenvolvimento front-end, mas não substituem mecanismos de segurança implementados no servidor.

O projeto aplica e documenta conceitos como:

* **Hash de senha com salt** (`js/security.js`) em vez de armazenar a senha em texto puro. Isso demonstra o conceito de hashing, mas o armazenamento continua sendo local e não deve ser considerado seguro para produção.
* **Rate limiting simulado** no login, com bloqueio após 5 tentativas (`js/config.js`). A proteção é apenas client-side e, portanto, pode ser contornada pelo usuário.
* **Sanitização de saída** (`escapeHTML` em `js/utils.js`) antes de inserir conteúdo dinâmico com `innerHTML`, reduzindo riscos de XSS no contexto da aplicação.
* **Content-Security-Policy** configurada via `<meta>` nas páginas, restringindo as origens permitidas para scripts, estilos, fontes e imagens.
* **Honeypot** nos formulários de newsletter, login e cadastro, como proteção simples contra bots.
* **`maxlength`** nos campos sensíveis do checkout como camada adicional de defesa, além das validações realizadas no envio.
* **Validação client-side** de CPF, CEP, telefone, cartão via algoritmo de Luhn e demais campos do checkout. Em produção, todas essas validações precisariam ser repetidas no backend, pois o navegador do usuário não é uma fronteira de confiança.

> Em um sistema real, seriam necessários mecanismos no servidor como HTTPS obrigatório, armazenamento seguro de credenciais com algoritmos apropriados (como bcrypt ou Argon2), gerenciamento seguro de sessão/autorização, proteção contra CSRF quando aplicável, validação server-side, gateway de pagamento compatível com PCI DSS e cabeçalhos de segurança HTTP como CSP, HSTS e X-Content-Type-Options.

---

## 🔌 Pronto para um backend futuro

A arquitetura atual mantém o acesso aos dados locais centralizado em `js/storage.js`, reduzindo o acoplamento direto ao `localStorage` e facilitando uma futura substituição por uma API real.

* `js/storage.js` centraliza as operações de persistência local. Em uma futura migração para backend, ele pode ser substituído ou adaptado para trabalhar com uma API, reduzindo o impacto da mudança nos demais módulos.
* `js/api.js` já possui a estrutura documentada para receber chamadas reais, incluindo timeout de rede, cabeçalhos e tratamento de erros.
* `js/config.js` mantém `FEATURE_FLAGS.USE_BACKEND` e `API_BASE_URL` centralizados para facilitar a configuração do ambiente.
* A migração para backend também exigiria adaptações nos módulos que dependem de autenticação, persistência e operações assíncronas, além da implementação de sessões/autorização no servidor.
* No CSP de cada página HTML, a diretiva `connect-src 'self'` precisaria incluir o domínio da API quando as chamadas externas fossem habilitadas.

A implementação atual permanece **100% client-side e educacional**. A estrutura foi organizada para facilitar uma evolução futura, mas não representa uma integração backend já existente.

---

## Dicas de manutenção

* Mantenha os atributos `data-*` nos `product-card`: `data-id`, `data-name`, `data-category`, `data-price`, `data-description`, `data-image`. É a partir deles que o carrinho, o modal e os filtros funcionam.
* **Importante:** se o mesmo produto aparece em `index.html` (destaque) e em `produtos.html` (catálogo), use o **mesmo `data-id`** e os **mesmos dados** nos dois lugares — do contrário ele vira duas linhas diferentes no carrinho (era um bug do projeto original, corrigido nesta revisão).
* Se o modal não abrir: confira se `#product-modal` e seus elementos filhos (`#modal-image`, `#modal-title`, etc.) existem na página.
* Para internacionalizar moeda, ajuste `formatCurrency()` em `js/utils.js`.
* Para adicionar uma nova categoria de produto, crie um novo botão `.filter-btn` com `data-category="NomeDaCategoria"` em `produtos.html` e use o mesmo valor no `data-category` dos produtos correspondentes.
* O CSS é modular (`css/base`, `css/layout`, `css/components`, `css/pages`, `css/utilities`) — use os nomes das pastas como guia de onde mexer.
* O JS é modular (`js/*.js`) — use `js/main.js` como mapa de quem inicializa o quê.

---

## Próximos passos sugeridos

A versão atual está concluída dentro do escopo **front-end educacional**. As possibilidades abaixo representam uma evolução futura do projeto, e não funcionalidades necessárias para a versão atual.

### Backend e produção

* Conectar autenticação, carrinho e checkout a uma API real, utilizando `js/api.js` como ponto de partida.
* Substituir o armazenamento local por persistência em banco de dados.
* Implementar autenticação e gerenciamento de sessão no servidor.
* Adicionar histórico de pedidos associado a usuários reais.
* Integrar um serviço de envio de e-mails para confirmações de pedidos.
* Integrar um gateway de pagamento real em um ambiente compatível com os requisitos de segurança aplicáveis.

### Evolução técnica

* Migrar de `@import` no CSS para um bundler como Vite ou esbuild quando o projeto crescer além do escopo atual.
* Adicionar internacionalização (i18n) caso o projeto passe a atender diferentes idiomas ou mercados.

---

## Contato

Desenvolvido por NHZ WebSolutions — Francisco Almeida
