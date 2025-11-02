# Plano de Ação - OBY Energy Form

**Objetivo:** Corrigir problemas críticos e refatorar aplicação para produção
**Prazo Total Estimado:** 8-12 semanas
**Prioridade:** Alta

---

## 🚨 FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA (Semanas 1-2)

**BLOQUEADOR PARA PRODUÇÃO**

### Sprint 1.1 - Segurança de Credenciais (3 dias)

- [ ] **Dia 1:**
  - [ ] Criar repositório Git privado
  - [ ] Configurar `.env.local` e `.env.example`
  - [ ] Mover todas as credenciais para variáveis de ambiente
  - [ ] Adicionar `.env.local` ao `.gitignore`
  - [ ] Criar documentação de setup de ambiente
  - [ ] **Teste:** Verificar que código não tem credenciais hardcoded

- [ ] **Dia 2:**
  - [ ] Configurar Row Level Security (RLS) no Supabase
  - [ ] Criar políticas de acesso para tabelas:
    - [ ] `propostas`
    - [ ] `vendedores`
    - [ ] `configuracoes`
    - [ ] `admin_users`
  - [ ] Testar políticas com usuários diferentes
  - [ ] **Teste:** Tentar acessar dados sem autenticação (deve falhar)

- [ ] **Dia 3:**
  - [ ] Rotacionar chaves do Supabase (gerar novas)
  - [ ] Atualizar `.env.local` com novas chaves
  - [ ] Criar tabela `admin_users` no banco
  - [ ] Documentar processo de rotação de credenciais
  - [ ] **Teste:** Verificar que aplicação funciona com novas chaves

**Entregável:** Aplicação sem credenciais expostas + RLS configurado

---

### Sprint 1.2 - Autenticação Real (4 dias)

- [ ] **Dia 1:**
  - [ ] Habilitar Supabase Auth no painel
  - [ ] Criar service de autenticação (`auth.service.ts`)
  - [ ] Criar hook `useAuth()`
  - [ ] Implementar login com email/senha
  - [ ] **Teste:** Login funcional

- [ ] **Dia 2:**
  - [ ] Criar componente `AdminLogin.tsx`
  - [ ] Criar componente `ProtectedRoute.tsx`
  - [ ] Implementar validação de admin
  - [ ] Adicionar listener de mudanças de auth
  - [ ] **Teste:** Apenas admins podem acessar admin panel

- [ ] **Dia 3:**
  - [ ] Implementar logout
  - [ ] Adicionar expiração de sessão (24h)
  - [ ] Criar sistema de refresh tokens
  - [ ] Adicionar logs de acesso
  - [ ] **Teste:** Logout funciona + sessão expira corretamente

- [ ] **Dia 4:**
  - [ ] Remover autenticação antiga (localStorage)
  - [ ] Migrar usuários admin existentes
  - [ ] Criar usuário admin padrão via seed
  - [ ] Documentar processo de criação de novos admins
  - [ ] **Teste:** Sistema completo de auth funcionando

**Entregável:** Autenticação segura implementada

---

### Sprint 1.3 - Upload de Arquivos Seguro (3 dias)

- [ ] **Dia 1:**
  - [ ] Instalar dependências: `uuid`
  - [ ] Criar `upload.service.ts`
  - [ ] Implementar validação de MIME type (magic numbers)
  - [ ] Implementar geração de nomes únicos (UUID)
  - [ ] **Teste:** Validação rejeita tipos inválidos

- [ ] **Dia 2:**
  - [ ] Configurar Storage Policies no Supabase
  - [ ] Implementar upload paralelo
  - [ ] Adicionar validação de tamanho server-side
  - [ ] Implementar rollback em caso de erro
  - [ ] **Teste:** Upload só aceita tipos permitidos

- [ ] **Dia 3:**
  - [ ] Implementar função de deletar arquivo
  - [ ] Adicionar limpeza de arquivos órfãos
  - [ ] Criar cron job para limpeza (Supabase Edge Functions)
  - [ ] Documentar processo de upload
  - [ ] **Teste:** Upload completo funcionando

**Entregável:** Upload seguro com validações

---

## 🏗️ FASE 2: REFATORAÇÃO DE ARQUITETURA (Semanas 3-5)

### Sprint 2.1 - Setup do Projeto (5 dias)

- [ ] **Dia 1:**
  - [ ] Criar novo projeto com Vite + React + TypeScript
    ```bash
    npm create vite@latest oby-energy-app -- --template react-ts
    ```
  - [ ] Instalar dependências base:
    ```bash
    npm install @supabase/supabase-js
    npm install react-router-dom
    npm install tailwindcss postcss autoprefixer
    npm install zod react-hook-form @hookform/resolvers
    npm install sonner
    npm install decimal.js
    npm install uuid
    npm install react-input-mask
    ```
  - [ ] Configurar Tailwind CSS
  - [ ] Configurar ESLint + Prettier
  - [ ] **Teste:** Projeto inicia sem erros

- [ ] **Dia 2:**
  - [ ] Criar estrutura de pastas conforme recomendado
  - [ ] Configurar aliases no `tsconfig.json`
  - [ ] Criar configuração do Supabase
  - [ ] Criar tipos base (`types/`)
  - [ ] **Teste:** Imports funcionam com aliases

- [ ] **Dia 3-5:**
  - [ ] Migrar componente Login
  - [ ] Migrar serviço de auth
  - [ ] Migrar rotas principais
  - [ ] Configurar React Router
  - [ ] **Teste:** Login + navegação funcionando

**Entregável:** Projeto base configurado

---

### Sprint 2.2 - Migração do Form (7 dias)

- [ ] **Semana 1:**
  - [ ] Criar schemas Zod para validação
  - [ ] Criar serviço de propostas
  - [ ] Criar serviço de simulação
  - [ ] Adicionar testes unitários para simulação
  - [ ] Migrar step 1 (dados pessoais)
  - [ ] Migrar step 2 (endereço)
  - [ ] Migrar step 3 (instalação)
  - [ ] Migrar step 4 (simulação)
  - [ ] Migrar step 5 (documentos)
  - [ ] Adicionar máscaras de input
  - [ ] Adicionar validação em tempo real
  - [ ] Criar componente de upload
  - [ ] **Teste:** Form completo funciona

**Entregável:** Form migrado e funcional

---

### Sprint 2.3 - Migração do Admin (7 dias)

- [ ] **Semana 1:**
  - [ ] Criar hook `usePropostas()`
  - [ ] Criar hook `useVendedores()`
  - [ ] Criar serviço de propostas
  - [ ] Criar serviço de vendedores
  - [ ] Migrar lista de propostas
  - [ ] Migrar modal de edição
  - [ ] Migrar gestão de vendedores
  - [ ] Migrar relatório financeiro
  - [ ] Migrar exportação CSV
  - [ ] Migrar editor de configurações
  - [ ] **Teste:** Admin completo funciona

**Entregável:** Admin migrado e funcional

---

## ✅ FASE 3: MELHORIAS DE QUALIDADE (Semanas 6-8)

### Sprint 3.1 - Testes (5 dias)

- [ ] **Setup de Testes:**
  - [ ] Instalar Vitest + Testing Library
    ```bash
    npm install -D vitest @testing-library/react @testing-library/jest-dom
    npm install -D @testing-library/user-event
    ```
  - [ ] Configurar Vitest
  - [ ] Criar helpers de teste

- [ ] **Testes Unitários:**
  - [ ] Testar validadores (CPF, CNPJ, email)
  - [ ] Testar cálculo de simulação (10+ cenários)
  - [ ] Testar formatadores
  - [ ] Testar serviço de upload
  - [ ] Meta: 80% de cobertura em utils e services

- [ ] **Testes de Integração:**
  - [ ] Testar fluxo de submissão de proposta
  - [ ] Testar fluxo de login
  - [ ] Testar CRUD de vendedores
  - [ ] Testar edição de propostas

**Entregável:** Cobertura de testes ≥ 70%

---

### Sprint 3.2 - UX/UI (5 dias)

- [ ] **Melhorias de UX:**
  - [ ] Implementar toasts (Sonner)
  - [ ] Adicionar loading skeletons
  - [ ] Adicionar estados vazios
  - [ ] Melhorar mensagens de erro
  - [ ] Adicionar preview de upload
  - [ ] Implementar drag & drop
  - [ ] Adicionar indicadores de progresso

- [ ] **Melhorias de UI:**
  - [ ] Revisar responsividade mobile
  - [ ] Adicionar animações (Framer Motion)
  - [ ] Padronizar cores e espaçamentos
  - [ ] Criar design system básico
  - [ ] Otimizar imagens (WebP)
  - [ ] Adicionar lazy loading

**Entregável:** UX/UI melhorada

---

### Sprint 3.3 - Performance (3 dias)

- [ ] **Otimizações:**
  - [ ] Implementar code splitting
  - [ ] Adicionar React.lazy() para rotas
  - [ ] Implementar useMemo/useCallback onde necessário
  - [ ] Otimizar re-renders (React DevTools Profiler)
  - [ ] Comprimir imagens
  - [ ] Adicionar cache de queries (React Query)
  - [ ] Implementar virtualização de listas longas

- [ ] **Análise:**
  - [ ] Executar Lighthouse (meta: >90)
  - [ ] Analisar bundle size (webpack-bundle-analyzer)
  - [ ] Medir Core Web Vitals
  - [ ] Otimizar conforme resultados

**Entregável:** Performance otimizada

---

## 🚀 FASE 4: PRODUÇÃO (Semanas 9-10)

### Sprint 4.1 - Deploy e Monitoramento (5 dias)

- [ ] **Setup de Deploy:**
  - [ ] Escolher plataforma (Vercel/Netlify recomendado)
  - [ ] Configurar variáveis de ambiente
  - [ ] Configurar domínio
  - [ ] Configurar SSL
  - [ ] Configurar CI/CD (GitHub Actions)

- [ ] **Monitoramento:**
  - [ ] Integrar Sentry para error tracking
  - [ ] Configurar Google Analytics
  - [ ] Configurar Hotjar/Clarity para UX analytics
  - [ ] Criar dashboard de métricas
  - [ ] Configurar alertas

- [ ] **Backup:**
  - [ ] Configurar backups automáticos do Supabase
  - [ ] Documentar processo de restore
  - [ ] Testar restore em ambiente de dev

**Entregável:** Aplicação em produção

---

### Sprint 4.2 - Documentação e Treinamento (5 dias)

- [ ] **Documentação Técnica:**
  - [ ] README.md completo
  - [ ] Documentar APIs
  - [ ] Documentar processo de deploy
  - [ ] Documentar processo de backup/restore
  - [ ] Criar guia de contribuição
  - [ ] Documentar troubleshooting

- [ ] **Documentação de Usuário:**
  - [ ] Manual do admin
  - [ ] Manual do vendedor
  - [ ] FAQs
  - [ ] Vídeos tutoriais

- [ ] **Treinamento:**
  - [ ] Treinar time de vendas
  - [ ] Treinar administradores
  - [ ] Criar checklist de onboarding

**Entregável:** Documentação completa

---

## 📊 FASE 5: MELHORIAS CONTÍNUAS (Semanas 11-12)

### Sprint 5.1 - Compliance LGPD (5 dias)

- [ ] **Implementações:**
  - [ ] Criptografar campos sensíveis (CPF, RG)
  - [ ] Implementar soft delete
  - [ ] Criar funcionalidade de exportar dados
  - [ ] Criar funcionalidade de deletar dados
  - [ ] Adicionar logs de acesso a dados
  - [ ] Revisar termos com advogado
  - [ ] Implementar política de retenção

- [ ] **Auditoria:**
  - [ ] Mapear fluxo de dados pessoais
  - [ ] Documentar base legal para processamento
  - [ ] Criar política de privacidade
  - [ ] Criar termos de uso
  - [ ] Revisar com DPO/advogado

**Entregável:** Compliance LGPD

---

### Sprint 5.2 - Features Extras (5 dias)

- [ ] **Nice to Have:**
  - [ ] Implementar busca avançada
  - [ ] Adicionar filtros salvos
  - [ ] Implementar exportação XLSX
  - [ ] Adicionar gráficos no dashboard
  - [ ] Implementar notificações por email
  - [ ] Adicionar suporte a múltiplos distribuidoras
  - [ ] Implementar histórico de alterações
  - [ ] Adicionar comentários em propostas

**Entregável:** Features adicionais

---

## 📋 CHECKLIST PRÉ-PRODUÇÃO

Antes de lançar em produção, verificar:

### Segurança
- [ ] Nenhuma credencial hardcoded
- [ ] RLS configurado e testado
- [ ] Autenticação real implementada
- [ ] Upload de arquivos validado
- [ ] HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] Inputs sanitizados

### Funcionalidade
- [ ] Todos os fluxos testados manualmente
- [ ] Testes automatizados passando
- [ ] Validações funcionando
- [ ] Cálculos corretos
- [ ] Upload/download de arquivos funcionando
- [ ] Emails sendo enviados
- [ ] Relatórios gerando corretamente

### Performance
- [ ] Lighthouse score > 90
- [ ] Tempo de carregamento < 3s
- [ ] Bundle size otimizado
- [ ] Imagens otimizadas
- [ ] Cache configurado

### UX
- [ ] Responsivo em mobile/tablet/desktop
- [ ] Mensagens de erro claras
- [ ] Loading states em todas as ações
- [ ] Navegação intuitiva
- [ ] Acessibilidade básica (WCAG AA)

### Compliance
- [ ] Termos de uso
- [ ] Política de privacidade
- [ ] Consentimento LGPD
- [ ] Logs de acesso
- [ ] Processo de exclusão de dados

### DevOps
- [ ] CI/CD configurado
- [ ] Backups automáticos
- [ ] Monitoramento configurado
- [ ] Alertas configurados
- [ ] Processo de rollback documentado

---

## 🎯 MÉTRICAS DE SUCESSO

### Técnicas
- ✅ Cobertura de testes ≥ 70%
- ✅ Lighthouse score ≥ 90
- ✅ Zero credenciais expostas
- ✅ Bundle size < 500KB
- ✅ Tempo de carregamento < 3s

### Negócio
- ✅ 95% das propostas submetidas com sucesso
- ✅ Tempo médio de submissão < 5min
- ✅ Taxa de erro < 1%
- ✅ Uptime > 99.5%

---

## 📞 SUPORTE PÓS-LANÇAMENTO

### Semana 1 após lançamento:
- [ ] Monitoramento diário de erros
- [ ] Análise de feedback de usuários
- [ ] Hotfixes imediatos se necessário
- [ ] Ajustes de performance

### Mês 1 após lançamento:
- [ ] Análise de métricas de uso
- [ ] Identificar gargalos
- [ ] Planejar melhorias
- [ ] Revisar processos

---

## 💰 ESTIMATIVA DE CUSTOS

### Infraestrutura (mensal):
- Supabase Pro: ~$25/mês
- Vercel Pro: ~$20/mês
- Sentry: ~$26/mês (plano team)
- Domínio: ~$15/ano
- **Total: ~$71/mês + $15/ano**

### Desenvolvimento:
- Desenvolvedor Pleno: 8-12 semanas @ 40h/semana
- **Total: 320-480 horas de desenvolvimento**

---

## 🚦 STATUS ATUAL vs META

| Item | Status Atual | Meta | Prioridade |
|------|--------------|------|------------|
| Segurança | 🔴 2/10 | 🟢 9/10 | CRÍTICA |
| Arquitetura | 🟡 4/10 | 🟢 8/10 | ALTA |
| Testes | 🔴 0/10 | 🟢 7/10 | ALTA |
| Performance | 🟡 5/10 | 🟢 9/10 | MÉDIA |
| UX | 🟢 7/10 | 🟢 9/10 | MÉDIA |
| LGPD | 🔴 2/10 | 🟢 9/10 | ALTA |

---

Este plano de ação é **incremental** e **priorizável**. Recomenda-se fortemente completar **Fase 1 (Segurança)** antes de qualquer lançamento em produção.
