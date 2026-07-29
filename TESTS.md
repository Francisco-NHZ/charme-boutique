# 🧪 Testes das funções puras de validação

Todas as funções de validação usadas no checkout, login e carrinho foram
extraídas e testadas isoladamente em Node.js (sem depender do navegador).
São elas que decidem se um CPF, cartão, e-mail ou CEP é aceito — por isso
merecem teste dedicado.

```
OK   - parsePrice R$ 199,90 -> 199.9
OK   - parsePrice R$ 1.299,90 -> 1299.9
OK   - formatCurrency 199.9 -> R$ 199,90
OK   - isValidEmail ok
OK   - isValidEmail sem @ falha
OK   - CPF válido 111.444.777-35
OK   - CPF inválido (dígitos repetidos)
OK   - CPF inválido (dv errado)
OK   - CEP válido 74000-000
OK   - CEP sem hífen (aceito pelo regex)
OK   - Telefone válido (62) 98218-9869
OK   - Telefone inválido letras
OK   - Cartão Luhn válido 4111111111111111
OK   - Cartão Luhn inválido
OK   - Validade futura válida 12/29
OK   - Validade passada inválida 01/20
OK   - CVV válido 123
OK   - CVV inválido ab1
OK   - Força de senha fraca ''
OK   - Força de senha forte Abc123!@

20 passaram, 0 falharam.
```

**Observação sobre `isValidCEP`:** o regex aceita CEP com ou sem hífen
(`74000-000` e `74000000` são ambos válidos) — isso é intencional, não bug,
já que muita gente digita CEP sem hífen.

## Fluxos testados manualmente (exigem DOM/navegador)
- ✅ Busca por texto + filtro por categoria combinados em `produtos.html`
  (após corrigir o bug do `#site-search` duplicado — ver `REVIEW.md`).
- ✅ Adicionar item pelo card e pelo modal → contador do header atualiza.
- ✅ Alterar quantidade, remover item, "Limpar carrinho" (com confirmação).
- ✅ Carrinho vazio desabilita o botão "Finalizar compra".
- ✅ Cadastro cria usuário → login funciona → 5 erros seguidos bloqueiam por
  30s → sessão aparece como "Olá, Nome" no header.
- ✅ Checkout: campos de cartão somem ao escolher Pix/Boleto; pedido salvo
  em `localStorage.charme_orders`; tela de confirmação exibe o número do
  pedido; carrinho esvazia depois da confirmação.
