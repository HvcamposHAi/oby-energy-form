# 🔧 Como Aplicar a Correção no Admin.html

## 📍 Localização do Código Corrigido

O código corrigido está em: **`admin-funcao-corrigida.js`**

---

## ✅ Passo a Passo de Instalação

### **PASSO 1: Atualizar as Bibliotecas no `<head>`**

Localize no seu **Admin.html** a tag `<head>` e faça as seguintes alterações:

#### ❌ REMOVER:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

#### ✅ ADICIONAR:
```html
<!-- Bibliotecas para geração de DOCX -->
<script src="https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
```

**Resultado final no `<head>`:**
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OBY Energy - Painel Administrativo</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Bibliotecas para geração de DOCX -->
    <script src="https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
</head>
```

---

### **PASSO 2: Substituir a Função Antiga**

#### 2.1. Localizar a função antiga

Procure no seu **Admin.html** por:
```javascript
const gerarContratoPDF = (proposta) => {
```

Ou:
```javascript
function gerarContratoPDF(proposta) {
```

**Dica:** Use `Ctrl+F` (ou `Cmd+F` no Mac) e busque por `gerarContratoPDF`

#### 2.2. Deletar a função antiga COMPLETA

Delete TODA a função `gerarContratoPDF`, desde a linha que começa com:
```javascript
const gerarContratoPDF = (proposta) => {
```

Até o fechamento da função:
```javascript
};
```

**⚠️ IMPORTANTE:** Delete TUDO entre o início e o fim da função!

#### 2.3. Copiar e colar a nova função

Abra o arquivo **`admin-funcao-corrigida.js`** e:

1. **Copie TUDO** (Ctrl+A, Ctrl+C)
2. **Cole no lugar** onde estava a função antiga

---

### **PASSO 3: Atualizar o Botão de Gerar Contrato**

Localize o botão que chama a função de gerar contrato. Procure por algo como:

#### ❌ ANTES:
```javascript
<button onClick={() => gerarContratoPDF(proposta)} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
    📄 PDF
</button>
```

#### ✅ DEPOIS:
```javascript
<button onClick={() => gerarContratoDocx(proposta)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
    📄 DOCX
</button>
```

**Mudanças:**
1. `gerarContratoPDF` → `gerarContratoDocx`
2. `bg-green-600` → `bg-blue-600` (opcional, apenas muda a cor)
3. `PDF` → `DOCX` (texto do botão)

---

### **PASSO 4: Configurar Templates (SE NECESSÁRIO)**

Se a tabela `contrato_templates` ainda não existe no banco:

1. Acesse o **Painel Admin**
2. Vá na aba **"Editor de Contrato"**
3. Crie pelo menos 1 template com o texto do contrato
4. Use variáveis como `{{NOME_COMPLETO}}`, `{{CPF_CNPJ}}`, etc.

**Exemplo de template:**
```
CLÁUSULA PRIMEIRA - DO OBJETO

O presente contrato tem como objeto a prestação de serviços de energia
para o CONTRATANTE {{NOME_COMPLETO}}, CPF/CNPJ {{CPF_CNPJ}}, com
instalação número {{NUMERO_INSTALACAO}}.

O desconto aplicado é de {{DESCONTO_PERCENTUAL}}%, gerando uma economia
mensal estimada de {{ECONOMIA_MENSAL}}.
```

---

## 🧪 Como Testar

### Teste Rápido (sem banco de dados):

1. Abra o arquivo **`exemplo-geracao-contrato.html`** no navegador
2. Clique em "Gerar Contrato DOCX (Exemplo)"
3. Verifique se o arquivo baixa corretamente
4. Abra no Word/LibreOffice e veja a formatação

### Teste Completo (no Admin real):

1. Acesse o **Painel Admin**
2. Vá em uma proposta **aprovada**
3. Clique no botão **"📄 DOCX"**
4. Verifique que:
   - ✅ Arquivo baixou automaticamente
   - ✅ Nome do arquivo está correto
   - ✅ Abre no Word/LibreOffice sem erros
   - ✅ Dados do cliente estão corretos
   - ✅ Variáveis foram substituídas (não tem `{{...}}` no texto)
   - ✅ Formatação está profissional

---

## 🔍 Onde Encontrar Cada Parte no Admin.html

### Estrutura típica do Admin.html:

```
Admin.html
├── <head>
│   ├── Scripts React/Babel/Tailwind
│   └── [AQUI] Scripts docx.js e FileSaver.js  ← PASSO 1
│
├── <body>
│   └── <script type="text/babel">
│       ├── Configurações (SUPABASE_URL, etc)
│       ├── Componentes React
│       │   ├── FinancialReport
│       │   ├── EditPropostaModal
│       │   ├── VendedoresGestao
│       │   └── AdminPanel
│       │       ├── Estados (useState)
│       │       ├── [AQUI] Função gerarContratoDocx  ← PASSO 2
│       │       ├── Outras funções (carregarPropostas, etc)
│       │       └── Render (JSX)
│       │           └── [AQUI] Botão de gerar contrato  ← PASSO 3
│       │
│       └── ReactDOM.render
```

---

## 📋 Checklist de Instalação

Marque cada item conforme você completa:

- [ ] **PASSO 1:** Adicionei docx.js e FileSaver.js no `<head>`
- [ ] **PASSO 1:** Removi jsPDF do `<head>`
- [ ] **PASSO 2:** Localizei a função `gerarContratoPDF` antiga
- [ ] **PASSO 2:** Deletei COMPLETAMENTE a função antiga
- [ ] **PASSO 2:** Colei a nova função `gerarContratoDocx`
- [ ] **PASSO 3:** Encontrei o botão de gerar contrato
- [ ] **PASSO 3:** Mudei `gerarContratoPDF` para `gerarContratoDocx`
- [ ] **PASSO 3:** (Opcional) Mudei o texto do botão para "DOCX"
- [ ] **PASSO 4:** Configurei templates no "Editor de Contrato"
- [ ] **TESTE:** Testei com exemplo-geracao-contrato.html
- [ ] **TESTE:** Testei no Admin real com uma proposta

---

## ❌ Erros Comuns e Soluções

### Erro: "Cannot read property 'Document' of undefined"
**Causa:** Biblioteca docx.js não foi carregada
**Solução:** Verifique se adicionou corretamente a linha do docx.js no `<head>`

### Erro: "saveAs is not defined"
**Causa:** Biblioteca FileSaver.js não foi carregada
**Solução:** Verifique se adicionou corretamente a linha do FileSaver.js no `<head>`

### Erro: "Nenhum template de contrato encontrado"
**Causa:** Tabela contrato_templates está vazia
**Solução:** Configure templates na aba "Editor de Contrato"

### Variáveis não são substituídas (aparece {{...}} no documento)
**Causa:** Template não usa o formato correto
**Solução:** Use exatamente `{{VARIAVEL}}` (chaves duplas, nome maiúsculo)

### Botão não funciona / não faz nada
**Causa:** Nome da função está errado ou não foi substituída
**Solução:** Verifique se mudou `gerarContratoPDF` para `gerarContratoDocx` no botão

---

## 📞 Suporte

Se tiver problemas:

1. **Abra o Console do navegador** (F12) e veja os erros
2. **Confira cada passo** deste guia novamente
3. **Teste primeiro** com o `exemplo-geracao-contrato.html`
4. **Verifique** se as bibliotecas foram carregadas:
   ```javascript
   // No console do navegador (F12), digite:
   console.log(typeof docx); // Deve retornar "object"
   console.log(typeof saveAs); // Deve retornar "function"
   ```

---

## 📁 Arquivos de Referência

- **`admin-funcao-corrigida.js`** - Código da função (copie daqui)
- **`exemplo-geracao-contrato.html`** - Exemplo funcional para teste
- **`CORRECAO_GERACAO_CONTRATO.md`** - Documentação completa
- **`COMO-APLICAR-CORRECAO.md`** - Este arquivo (guia rápido)

---

**Última atualização:** 02/11/2025
**Versão:** 1.0
