# Charmê Boutique

Projeto front-end de loja virtual fictícia com foco em identidade visual premium e interações JavaScript.

## Status (atualizado)
- Funcionalidades principais implementadas e testadas: página inicial, busca por produtos, modal de produto, carrinho simples (persistente via localStorage), resumo do carrinho e página de checkout simulada.
- CSS e JS foram modularizados em arquivos menores, organizados por responsabilidade (ver estrutura abaixo), para facilitar manutenção e leitura do código.

## O que o projeto inclui
- index.html: página inicial com hero, categorias e produtos em destaque
- produtos.html: lista de produtos com filtros
- carrinho.html: visualização do carrinho e resumo de compra
- sobre.html, login.html (template)
- style.css: arquivo principal de estilos — só contém `@import` apontando para os módulos em `css/`
- js/main.js: ponto de entrada do JavaScript — importa e inicializa todos os módulos em `js/`
- assets/: imagens e logos

## Estrutura do projeto

```
charme-2/
├── index.html
├── produtos.html
├── carrinho.html
├── sobre.html
├── login.html
├── style.css                 (importa tudo de css/)
├── css/
│   ├── base.css               reset, variáveis CSS (:root) e estilos gerais do body
│   ├── buttons.css            .btn e variantes (secundário, disabled)
│   ├── header.css             cabeçalho fixo, navegação, busca, menu mobile, barra de progresso
│   ├── hero.css                seção hero da home e hero genérico das páginas internas (page-hero)
│   ├── categories.css         grid de categorias da home
│   ├── products.css           grid de produtos, cards e botões dos cards
│   ├── contact.css            seção de contato, newsletter e status de busca
│   ├── modal.css              modal de detalhes do produto
│   ├── cart.css                página carrinho.html (itens, resumo, carrinho vazio)
│   └── footer.css             rodapé
├── js/
│   ├── main.js                 único arquivo referenciado no HTML — importa e inicializa os demais
│   ├── utils.js                 parsePrice, formatCurrency, CART_KEY
│   ├── cart.js                  estado do carrinho, localStorage, renderização da página do carrinho
│   ├── modal.js                 abrir/fechar modal de produto + cliques nos botões dos cards
│   ├── search.js                filtro de produtos (busca por nome/categoria/descrição)
│   ├── header.js                 menu mobile, toggle de busca, header some ao rolar, link ativo
│   ├── newsletter.js            validação e feedback do formulário de newsletter
│   └── scrollReveal.js          animação de revelação de elementos ao rolar a página
└── assets/
    └── (imagens e logos)
```

## Novas implementações / observações
- Carrinho persistente em localStorage (chave: `cart`).
- Contador do carrinho atualiza seja como `<span id="cart-counter">0</span>` ou como link inteiro com `id="cart-counter"`.
- Modal de produto abre por delegação de eventos nas classes `.product-details-btn` e fecha ao clicar no backdrop, no botão com `data-close-modal` ou pressionar Esc (via `data-close-modal`, sem listener de teclado ainda — ver "Próximos passos").
- Barra de progresso de scroll (#scroll-progress) criada dinamicamente pelo JS (em `js/header.js`).
- JS organizado em **módulos ES** (`import`/`export`). Isso exige que o site seja aberto via servidor local (`http://`), não direto pelo `file://`.
- CSS organizado com `@import` dentro de `style.css`, que é o único arquivo referenciado no `<head>` de cada página.

## Como executar
- **Não** abrir `index.html` direto pelo navegador (módulos ES não funcionam com `file://`).
- Recomendado: usar Live Server (VS Code) para reload automático:
  - Instale a extensão Live Server
  - Clique com o botão direito em `index.html` > "Open with Live Server"

## Como testar rapidamente
- Abrir página inicial
- Clicar em "Ver detalhes" em qualquer card de produto (modal deve abrir)
- Clicar em "Adicionar ao carrinho" para incrementar o contador
- Abrir `carrinho.html` para ver itens, alterar quantidades e remover itens
- Verificar footer e ano automático (elemento `#current-year`)
- Abrir o console do navegador (F12): se algo quebrar, o erro agora aponta para o arquivo `.js` exato, o que facilita bastante o debug

## Dicas de manutenção
- Manter os atributos data-* nos product-cards: `data-id`, `data-name`, `data-price`, `data-description`, `data-image`.
- Se o modal não abrir: verificar se elementos do modal (`#product-modal`, `#modal-image`, `#modal-title`, etc.) existem no HTML e se `css/modal.css` está sendo importado em `style.css`.
- Para internacionalização de moeda, ajustar `formatCurrency()` em `js/utils.js`.
- Para adicionar uma nova seção de estilos: criar um novo arquivo em `css/` e adicionar a linha `@import url("css/novo-arquivo.css");` em `style.css`.
- Para adicionar uma nova funcionalidade JS: criar um novo módulo em `js/`, exportar as funções necessárias e importá-las em `js/main.js`.

## Próximos passos sugeridos
- Implementar carrinho remoto (API)
- Persistir sessão do usuário / login
- Testes unitários para funções utilitárias (`js/utils.js` é um bom ponto de partida por não depender do DOM)
- Melhor acessibilidade do modal (focus trap + fechar com tecla Esc)
- Completar produtos.html com os cards de produto reais (hoje é uma página "em breve")

## Contato
Desenvolvido por NHZ WebSolutions — Francisco Almeida
