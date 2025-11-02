# Análise Completa dos Códigos OBY Energy

**Data da Análise:** 2025-11-02
**Arquivos Analisados:** Admin.html e Form.html

---

## 🔴 PROBLEMAS CRÍTICOS DE SEGURANÇA

### 1. Credenciais Expostas no Código-Fonte

**Severidade:** CRÍTICA ⚠️

```javascript
// EXPOSTO EM AMBOS OS ARQUIVOS:
const SUPABASE_URL = 'https://uuaqmwnfjopgjmjjchmw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// ADMIN.HTML:
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'oby2025';
```

**Problemas:**
- ✗ Chave do Supabase completamente exposta (anon key)
- ✗ Credenciais de admin hardcoded
- ✗ Qualquer pessoa pode ver o código-fonte e acessar o banco
- ✗ Sem rotação de credenciais
- ✗ Sem variáveis de ambiente

**Impacto:**
- Acesso não autorizado ao banco de dados
- Possibilidade de vazamento de dados pessoais (LGPD)
- Risco de manipulação de propostas
- Risco de exclusão de dados

**Recomendações:**
1. Mover credenciais para variáveis de ambiente
2. Implementar autenticação real (Supabase Auth)
3. Usar Row Level Security (RLS) no Supabase
4. Nunca expor service_role key no frontend
5. Implementar API intermediária (backend)

---

### 2. Autenticação Insegura (Admin)

**Severidade:** CRÍTICA ⚠️

```javascript
const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        setIsAuthenticated(true);
        localStorage.setItem('oby_admin_auth', 'true'); // ❌ INSEGURO
    }
};
```

**Problemas:**
- ✗ Autenticação baseada apenas em localStorage
- ✗ Sem token JWT
- ✗ Sem expiração de sessão
- ✗ Vulnerável a XSS (basta executar `localStorage.setItem('oby_admin_auth', 'true')`)
- ✗ Sem logout real do servidor
- ✗ Senha em texto plano na comparação

**Impacto:**
- Qualquer pessoa com acesso ao DevTools pode se autenticar
- Sessões infinitas sem controle
- Sem auditoria de acessos

**Recomendações:**
1. Implementar Supabase Auth com email/senha
2. Usar tokens JWT com expiração
3. Implementar refresh tokens
4. Adicionar MFA (autenticação de dois fatores)
5. Registrar logs de acesso

---

### 3. Uploads de Arquivos Sem Validação Adequada

**Severidade:** ALTA 🔴

```javascript
const uploadFile = async (file, folder) => {
    const fileName = `${Date.now()}_${file.name}`; // ❌ Previsível

    const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${folder}/${fileName}`,
        {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': file.type // ❌ Confia no cliente
            },
            body: file
        }
    );
};
```

**Problemas:**
- ✗ Validação de tipo MIME apenas no cliente (pode ser burlada)
- ✗ Sem validação de extensão real do arquivo
- ✗ Nomes de arquivo previsíveis
- ✗ Sem sanitização de nome de arquivo
- ✗ Limite de tamanho apenas no cliente (10MB hardcoded)
- ✗ Sem verificação de vírus/malware
- ✗ Sem validação de dimensões de imagem

**Impacto:**
- Upload de arquivos maliciosos
- Possível path traversal
- Esgotamento de storage

**Recomendações:**
1. Implementar validação server-side
2. Usar UUIDs para nomes de arquivo
3. Validar magic numbers (assinatura binária)
4. Implementar antivírus scanner
5. Configurar bucket policies no Supabase
6. Limitar tamanhos por tipo de arquivo

---

## 🟠 PROBLEMAS DE ARQUITETURA

### 4. Código Monolítico

**Severidade:** ALTA 🔴

**Problemas:**
- ✗ Todo código em um único arquivo HTML
- ✗ 2000+ linhas de código sem modularização
- ✗ React inline com Babel no browser (performance ruim)
- ✗ Dependências via CDN (confiabilidade questionável)
- ✗ Sem build process
- ✗ Sem minificação
- ✗ Sem tree shaking

**Impacto:**
- Difícil manutenção
- Difícil testes
- Performance degradada
- Sem cache efetivo
- Tempo de carregamento alto

**Recomendações:**
1. Migrar para Create React App ou Vite
2. Separar componentes em arquivos
3. Implementar build process
4. Usar npm/yarn para dependências
5. Implementar code splitting
6. Adicionar bundle analyzer

---

### 5. Sem Separação de Camadas

**Severidade:** MÉDIA 🟡

**Problemas:**
- ✗ Lógica de negócio misturada com UI
- ✗ Chamadas de API diretamente nos componentes
- ✗ Sem camada de serviços
- ✗ Sem repositórios
- ✗ Duplicação de código de fetching

**Exemplo do problema:**
```javascript
// Código duplicado em vários lugares:
const response = await fetch(`${SUPABASE_URL}/rest/v1/propostas`, {
    headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
    }
});
```

**Recomendações:**
1. Criar camada de serviços (services/)
2. Criar hooks customizados (usePropostas, useVendedores)
3. Implementar Repository Pattern
4. Usar React Query ou SWR para cache
5. Centralizar configuração de API

---

### 6. Gerenciamento de Estado Inadequado

**Severidade:** MÉDIA 🟡

**Problemas:**
- ✗ Apenas useState local
- ✗ Props drilling em alguns lugares
- ✗ Sem cache de dados
- ✗ Re-fetching desnecessário
- ✗ Sem otimização de re-renders

**Recomendações:**
1. Implementar Context API para estado global
2. Considerar Redux Toolkit ou Zustand
3. Usar React Query para server state
4. Implementar useMemo/useCallback onde necessário
5. Adicionar React DevTools profiling

---

## 🟡 PROBLEMAS DE LÓGICA DE NEGÓCIO

### 7. Cálculo de Simulação com Possíveis Erros

**Severidade:** MÉDIA 🟡

```javascript
const calcularSimulacao = async () => {
    // ...
    const consumoExcedente = consumo - minimo;
    const impostosNaoCompensaveis = consumoExcedente * tarifaImpostos;

    const energiaCativaAtual = consumoExcedente * tarifaEnergia;
    const contaAtual = consumoMinimoValor + impostosNaoCompensaveis + energiaCativaAtual;

    // E se consumo < minimo? Valores negativos não são tratados
};
```

**Problemas:**
- ✗ Não valida se consumo < mínimo antes do cálculo
- ✗ Pode gerar valores negativos
- ✗ Não trata erros de precisão decimal (usar Decimal.js)
- ✗ Não arredonda corretamente
- ✗ Falta validação de bandeiras tarifárias

**Recomendações:**
1. Adicionar validação: `if (consumo < minimo) throw new Error(...)`
2. Usar biblioteca Decimal.js para cálculos financeiros
3. Adicionar testes unitários para todos os cenários
4. Documentar fórmulas no código
5. Validar ranges de valores

---

### 8. Race Conditions em Vendedores

**Severidade:** BAIXA 🟢

```javascript
// FORM.HTML - carrega vendedores uma vez
useEffect(() => {
    carregarVendedores();
}, []);

// Mas não revalida no submit
const handleSubmit = async () => {
    // Se vendedor foi inativado entre carregamento e submit?
    const proposta = {
        vendedor_id: formData.vendedor, // ❌ Pode estar inativo
        // ...
    };
};
```

**Recomendações:**
1. Revalidar vendedor no submit
2. Adicionar constraint no banco (foreign key)
3. Implementar soft deletes
4. Adicionar validação server-side

---

## 🔵 PROBLEMAS DE USABILIDADE

### 9. Validação de Formulários Incompleta

**Severidade:** MÉDIA 🟡

**Problemas:**
- ✗ Sem máscaras para CPF, CNPJ, telefone, CEP
- ✗ CPF/CNPJ não validam dígitos verificadores
- ✗ Email validado apenas com HTML5
- ✗ Telefone não valida formato brasileiro
- ✗ Mensagens de erro genéricas

**Exemplo:**
```javascript
if (!formData.cpf) newErrors.cpf = 'Campo obrigatório'; // ❌ Genérico
```

**Recomendações:**
1. Usar react-input-mask para máscaras
2. Implementar validação de CPF/CNPJ com algoritmo correto
3. Usar Yup ou Zod para validação de schemas
4. Mensagens de erro específicas e amigáveis
5. Validação em tempo real (onBlur)

---

### 10. UX de Upload de Arquivos

**Severidade:** BAIXA 🟢

**Problemas:**
- ✗ Sem preview de imagens
- ✗ Sem indicador de progresso individual
- ✗ Sem drag & drop
- ✗ Não mostra tamanho do arquivo
- ✗ Não permite remover arquivo selecionado

**Recomendações:**
1. Adicionar preview de imagens (FileReader API)
2. Implementar drag & drop (react-dropzone)
3. Mostrar progresso de upload (XMLHttpRequest.upload.progress)
4. Adicionar botão para remover arquivo
5. Validação visual de dimensões/tamanho

---

### 11. Feedback ao Usuário Inadequado

**Severidade:** MÉDIA 🟡

**Problemas:**
```javascript
alert('✅ Proposta salva com sucesso!'); // ❌ Usar toasts modernos
```

- ✗ Usa `alert()` e `confirm()` nativos
- ✗ Sem loading states granulares
- ✗ Erros não são user-friendly
- ✗ Sem stack trace sanitizado
- ✗ Console.log exposto em produção

**Recomendações:**
1. Implementar toast library (react-hot-toast, sonner)
2. Loading skeletons para carregamento
3. Mensagens de erro contextualizadas
4. Remover console.log em produção
5. Adicionar Sentry para error tracking

---

## ⚡ PROBLEMAS DE PERFORMANCE

### 12. Carregamento de Imagens

**Severidade:** BAIXA 🟢

```javascript
<img src="https://...guia-copel-1.png" alt="Guia" className="w-full rounded-lg" />
<img src="https://...guia-copel-2.png" alt="Guia" className="w-full rounded-lg" />
```

**Problemas:**
- ✗ Imagens grandes sem lazy loading
- ✗ Sem webp/avif
- ✗ Sem srcset para responsividade
- ✗ Sem placeholders

**Recomendações:**
1. Implementar lazy loading (`loading="lazy"`)
2. Converter imagens para WebP
3. Usar srcset para diferentes resoluções
4. Adicionar blur placeholders

---

### 13. Uploads Sequenciais

**Severidade:** BAIXA 🟢

```javascript
if (formData.arquivoConta) contaUrl = await uploadFile(...);
if (formData.arquivoRGFrente) rgFrenteUrl = await uploadFile(...);
// ❌ Sequencial - pode ser paralelo
```

**Recomendações:**
1. Usar Promise.all() para uploads paralelos
2. Implementar retry logic
3. Adicionar progresso total
4. Cancelar uploads em caso de erro

---

## 📊 PROBLEMAS DE DADOS E INTEGRAÇÃO

### 14. Sem Validação de Relações

**Severidade:** MÉDIA 🟡

```javascript
// Admin não valida se vendedor existe antes de mostrar join
const response = await fetch(
    `${SUPABASE_URL}/rest/v1/propostas?select=*,vendedores(nome_completo)&order=data_criacao.desc`
);
// Se vendedor foi deletado, join retorna null silenciosamente
```

**Recomendações:**
1. Implementar soft deletes
2. Adicionar fallback para joins nulos
3. Validar foreign keys no banco
4. Adicionar constraints CASCADE

---

### 15. Exportação CSV Problemática

**Severidade:** BAIXA 🟢

```javascript
const csvContent = [cabecalho.join(';'), ...linhas].join('\n');
// ❌ Separador ';' pode causar problemas
// ❌ Sem escape de aspas duplas dentro de strings
// ❌ Sem BOM para UTF-8
```

**Recomendações:**
1. Usar biblioteca papaparse
2. Adicionar BOM UTF-8: `\uFEFF`
3. Escape correto de valores
4. Opção de exportar XLSX

---

## 🧪 PROBLEMAS DE QUALIDADE DE CÓDIGO

### 16. Sem Testes

**Severidade:** ALTA 🔴

**Problemas:**
- ✗ Zero cobertura de testes
- ✗ Sem testes unitários
- ✗ Sem testes de integração
- ✗ Sem testes E2E
- ✗ Difícil refatorar com segurança

**Recomendações:**
1. Adicionar Jest + React Testing Library
2. Testar cálculos de simulação (crítico)
3. Testar validações
4. Adicionar Cypress para E2E
5. CI/CD com testes obrigatórios

---

### 17. Sem TypeScript

**Severidade:** MÉDIA 🟡

**Problemas:**
- ✗ Sem type safety
- ✗ Erros apenas em runtime
- ✗ Difícil refatoração
- ✗ Sem autocomplete adequado
- ✗ Documentação implícita ruim

**Recomendações:**
1. Migrar para TypeScript
2. Definir interfaces para todos os modelos
3. Usar Zod para validação em runtime
4. Strict mode habilitado

---

## 🔐 PROBLEMAS DE COMPLIANCE (LGPD)

### 18. Tratamento de Dados Pessoais

**Severidade:** ALTA 🔴

**Problemas:**
- ✗ Dados sensíveis em logs (console.log com CPF, etc)
- ✗ Sem criptografia em campos sensíveis
- ✗ Arquivos armazenados sem criptografia
- ✗ Sem política de retenção de dados
- ✗ Sem mecanismo de exclusão de dados (direito ao esquecimento)
- ✗ Termo de aceite genérico

**Recomendações:**
1. Remover logs de dados sensíveis
2. Criptografar CPF/CNPJ/RG no banco
3. Implementar soft delete com expiração
4. Adicionar funcionalidade de exportar/deletar dados
5. Revisar termos com advogado especializado

---

## 📱 PROBLEMAS DE RESPONSIVIDADE

### 19. Design Responsivo Incompleto

**Severidade:** BAIXA 🟢

**Problemas:**
- ✗ Tabelas não são responsivas em mobile
- ✗ Modal de edição pode ser cortado em telas pequenas
- ✗ Formulário de 5 steps pode confundir em mobile

**Recomendações:**
1. Usar cards em vez de tabelas em mobile
2. Testar em dispositivos reais
3. Adicionar breakpoints específicos
4. Considerar mobile-first approach

---

## 🔄 RECOMENDAÇÕES PRIORITÁRIAS

### Curto Prazo (Crítico - Fazer IMEDIATAMENTE):

1. **Mover credenciais para variáveis de ambiente**
   - Criar arquivo `.env`
   - Remover hardcoded keys
   - Implementar RLS no Supabase

2. **Implementar autenticação real no admin**
   - Supabase Auth
   - Tokens JWT
   - Expiração de sessão

3. **Adicionar validação server-side**
   - Rules no Supabase
   - Triggers para validações
   - Constraints no banco

### Médio Prazo (Importante - 1-2 meses):

4. **Refatorar arquitetura**
   - Migrar para Vite/Next.js
   - Separar componentes
   - Implementar camada de serviços

5. **Adicionar testes**
   - Testes unitários para cálculos
   - Testes de integração
   - CI/CD

6. **Melhorar UX**
   - Máscaras de input
   - Validações em tempo real
   - Toast notifications

### Longo Prazo (Melhorias - 3-6 meses):

7. **Migrar para TypeScript**
8. **Implementar monitoramento (Sentry)**
9. **Adicionar analytics**
10. **Otimizar performance**

---

## 📈 MÉTRICAS DE QUALIDADE ATUAIS

| Métrica | Status | Nota |
|---------|--------|------|
| Segurança | 🔴 Crítico | 2/10 |
| Arquitetura | 🟡 Precisa Melhorar | 4/10 |
| Performance | 🟡 Aceitável | 5/10 |
| Usabilidade | 🟢 Boa | 7/10 |
| Manutenibilidade | 🔴 Ruim | 3/10 |
| Testes | 🔴 Inexistente | 0/10 |
| Documentação | 🟡 Básica | 4/10 |
| LGPD Compliance | 🔴 Não Conforme | 2/10 |

**Nota Geral: 3.4/10**

---

## 🎯 CONCLUSÃO

Os códigos apresentam funcionalidades boas e atendem aos requisitos básicos do negócio, mas possuem **problemas críticos de segurança** que devem ser resolvidos imediatamente antes de ir para produção.

A arquitetura monolítica dificulta manutenção e escalabilidade. Recomenda-se fortemente uma refatoração gradual seguindo as prioridades acima.

**Status para Produção: ❌ NÃO RECOMENDADO** até resolver itens críticos.

---

**Analista:** Claude Code
**Próxima Revisão:** Após implementação das correções críticas
