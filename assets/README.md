# 📁 Pasta assets/

Como já era avisado no `README.md` original do projeto, as **imagens não
fazem parte deste pacote de código** (são arquivos binários de exemplo,
sem licença clara para redistribuição). O site funciona normalmente sem
elas — só aparecerá o ícone de "imagem quebrada" do navegador no lugar.

Copie sua pasta `assets/` original (a mesma usada antes desta revisão)
para dentro deste projeto, mantendo exatamente estes nomes de arquivo
(são os mesmos `data-image` usados em `produtos.html` e `index.html`):

```
assets/
├── logo/
│   └── logo.svg
└── img/
    ├── bolsa-hero.png
    ├── bolsa-mykonos.png
    ├── bolsa-dubai.jpg
    ├── bolsa-havana.png
    ├── bolsa-florenca.png
    ├── necessaire-paris.jpg
    ├── necessaire-dubai.jpg
    ├── necessaire-havana.jpg
    ├── necessaire-florenca.jpg
    ├── oculos-riviera.png
    ├── oculos-dubai.jpg
    ├── oculos-havana.jpg
    ├── oculos-florenca.jpg
    ├── kit-maquiagem-glam.png
    ├── kit-maquiagem-dubai.jpg
    ├── kit-maquiagem-havana.png
    └── kit-maquiagem-florenca.png
```

Se você tiver fotos reais dos produtos, essa é a hora ideal de trocar —
é só substituir o arquivo mantendo o mesmo nome (ou atualizar o
`data-image` do `<article class="product-card">` correspondente em
`produtos.html`/`index.html` para apontar para o novo nome).
