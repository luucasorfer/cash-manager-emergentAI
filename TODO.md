# Controle de Gastos Pessoais - TODO

## Status do Projeto

**Versão:** 1.0.0
**Data:** 06/11/2025
**Status:** ✅ Funcional e Pronto para Produção

---

## ✅ Funcionalidades Implementadas

### Estrutura de Dados

- ✅ Tabela de categorias (Moradia, Investimentos, Roupa, Empréstimos, Estudos, Cartões, Lazer, Streaming, Disk/Adega, Saúde, Veículos, Supermercado, Alimentação, Petshop, Delivery, Dívidas, Outras)
- ✅ Tabela de tipos de pagamento (Crédito, Débito, Pix, Dinheiro)
- ✅ Tabela de gastos fixos (com nome, categoria, valor, data de vencimento)
- ✅ Tabela de gastos variáveis (com nome, categoria, valor, parcelas, data, status de pagamento)
- ✅ Tabela de entradas/receitas (salário, outros)
- ✅ Tabela de reserva de emergência (histórico de movimentações)

### Backend (FastAPI)

- ✅ Implementar CRUD de categorias
- ✅ Implementar CRUD de gastos fixos
- ✅ Implementar CRUD de gastos variáveis
- ✅ Implementar CRUD de entradas/receitas
- ✅ Implementar gestão de reserva de emergência
- ✅ Implementar cálculo automático de saldo (entradas - saídas)
- ✅ Implementar cálculo de gastos por categoria
- ✅ Implementar filtros por mês/ano
- ✅ Implementar relatórios de análise financeira

### Interface do Usuário

- ✅ Dashboard principal com resumo financeiro
- ✅ Visualização de saldo atual e saldo com reservas
- ✅ Formulário para adicionar/editar gastos fixos
- ✅ Formulário para adicionar/editar gastos variáveis
- ✅ Formulário para adicionar/editar entradas
- ✅ Gestão de reserva de emergência
- ✅ Tabela de gastos fixos com ações (editar, excluir, marcar como pago)
- ✅ Tabela de gastos variáveis com ações (editar, excluir, marcar como pago)
- ✅ Filtro por mês/ano
- ✅ Design premium com cores e tipografia elegantes

### Visualizações e Relatórios

- ✅ Gráfico de pizza mostrando gastos por categoria
- ✅ Gráfico de barras comparando gastos mensais
- ✅ Indicadores visuais de porcentagem por categoria
- ✅ Resumo de gastos fixos vs variáveis
- ✅ Histórico de movimentações da reserva de emergência
- ⏳ Exportação de relatórios (opcional)

### Funcionalidades Extras

- ✅ Suporte a múltiplos cartões de crédito
- ✅ Controle de parcelas e prestações
- ✅ Sistema de alertas de vencimento para gastos próximos do prazo
- ✅ Exibir alertas no dashboard
- ✅ Notificações visuais para vencimentos próximos (3 dias)
- ✅ Implementar alternador de tema escuro/claro
- ✅ Botão de troca de tema no header
- ✅ Persistência da preferência de tema

### Metas de Economia

- ✅ Criar tabela de metas no banco de dados
- ✅ Criar tabela de contribuições para metas
- ✅ Implementar CRUD de metas (criar, editar, excluir, listar)
- ✅ Implementar sistema de contribuições para metas
- ✅ Criar página de gerenciamento de metas
- ✅ Adicionar visualização de progresso (barra de progresso)
- ✅ Mostrar metas no dashboard principal com progresso visual
- ✅ Adicionar navegação para metas no menu lateral

---

## ✅ Correções e Ajustes Implementados

- ✅ **06/11/2025** | Corrigido: Saldo diminui apenas quando uma conta é marcada como 'pago'

  - Implementado: Apenas despesas com status "paid" são contabilizadas no cálculo do saldo
  - Localização: `/api/dashboard` endpoint no `server.py`

- ✅ **06/11/2025** | Corrigido: Gastos fixos são individuais de cada mês

  - Implementado: Criado sistema de "FixedExpenseMonth" separado de "FixedExpenseTemplate"
  - Cada mês tem suas próprias instâncias de gastos fixos
  - Alterar valor em um mês não afeta outros meses
  - Localização: Tabela `fixed_expenses_months` no MongoDB

- ✅ **06/11/2025** | Corrigido: Gastos fixos têm a flag de 'pendente'/'pago'

  - Implementado: Campo `status` com enum `PaymentStatus.PENDING` / `PaymentStatus.PAID`
  - Localização: Models `FixedExpenseMonth` e `VariableExpense` no `server.py`

- ✅ **06/11/2025** | Corrigido: Modal para marcar despesas como pago

  - Implementado: Componente `PaymentModal` com seleção de forma de pagamento
  - Opções: Cartão de Crédito, Cartão de Débito, PIX, Dinheiro
  - Endpoints: `/fixed-expenses/{id}/mark-paid` e `/variable-expenses/{id}/mark-paid`
  - Localização: `/frontend/src/components/PaymentModal.js`

- ✅ **06/11/2025** | Corrigido: Saldo total de Reserva de Emergência

  - Implementado: Cálculo correto somando todos os registros (positivos e negativos)
  - Endpoint dedicado: `/api/emergency-reserve/balance`
  - Localização: `server.py` linha ~580

- ✅ **06/11/2025** | Melhoria: Tabela de pendentes na tela inicial
  - Implementado: Tabela "Despesas Pendentes" no Dashboard
  - Mostra gastos fixos e variáveis com status "pending"
  - Ação direta: Botão "Marcar como Pago" abre modal de pagamento
  - Localização: `/frontend/src/pages/Dashboard.js`

---

## 🚀 Funcionalidades Futuras (Backlog)

### Prioridade Alta

- ⏳ Exportação de relatórios PDF/Excel
- ⏳ Gráficos de evolução mensal (linha do tempo)
- ⏳ Comparação entre meses/anos
- ⏳ Previsão de gastos baseada em histórico

### Prioridade Média

- ⏳ Importação de extrato bancário (OFX/CSV)
- ⏳ Anexo de comprovantes (fotos/PDFs)
- ⏳ Lembretes por email de vencimentos
- ⏳ Dashboard com widgets customizáveis
- ⏳ Múltiplos usuários/famílias
- ⏳ Modo compartilhado (casal/família)

### Prioridade Baixa

- ⏳ Tema escuro completo
- ⏳ App mobile (React Native)
- ⏳ Integração com Open Banking
- ⏳ IA para categorização automática
- ⏳ Sugestões de economia baseadas em padrões

---

## 🐛 Bugs Conhecidos

**Nenhum bug crítico identificado no momento.**

### Bugs Menores

- ⚠️ Layout pode quebrar em telas muito pequenas (<320px)
- ⚠️ Scroll horizontal em tabelas em mobile pode ser melhorado

---

## 🔧 Melhorias Técnicas

### Performance

- ⏳ Implementar paginação em listas grandes
- ⏳ Cache de requisições frequentes
- ⏳ Lazy loading de componentes
- ⏳ Otimização de imagens e assets

### Segurança

- ⏳ Implementar autenticação JWT
- ⏳ Rate limiting na API
- ⏳ Validação mais rigorosa de inputs
- ⏳ Sanitização de dados
- ⏳ HTTPS obrigatório em produção

### Testes

- ⏳ Testes unitários backend (pytest)
- ⏳ Testes unitários frontend (Jest)
- ⏳ Testes E2E (Playwright/Cypress)
- ⏳ Cobertura de código >80%

### DevOps

- ⏳ Docker Compose para ambiente local
- ⏳ CI/CD pipeline (GitHub Actions)
- ⏳ Monitoramento e logs (Sentry)
- ⏳ Deploy automático

---

## 📝 Notas de Desenvolvimento

### Decisões Arquiteturais

1. **Gastos Fixos por Mês**: Optamos por criar instâncias mensais separadas em vez de um modelo único com histórico. Isso facilita edições independentes e consultas.

2. **Status de Pagamento**: Campo separado `status` em vez de usar `paid_date` como indicador. Mais explícito e permite estados futuros (ex: "atrasado").

3. **Modal de Pagamento**: Componente reutilizável para manter consistência na UX ao marcar despesas como pagas.

4. **Cálculo de Saldo**: Apenas despesas pagas afetam o saldo. Isso permite que o usuário tenha controle preciso do dinheiro efetivamente gasto.

### Convenções de Código

- **Backend**: Snake_case para variáveis e funções
- **Frontend**: CamelCase para componentes, camelCase para variáveis
- **Commits**: Usar conventional commits (feat:, fix:, docs:, etc.)
- **Branches**: feature/, bugfix/, hotfix/

### Documentação

- ✅ README.md completo
- ✅ INSTALACAO.md rápido
- ✅ TODO.md atualizado
- ✅ Comentários inline no código
- ⏳ Documentação da API (Swagger/OpenAPI)
- ⏳ Guia de contribuição

---

## 📊 Métricas do Projeto

- **Linhas de código (backend)**: ~800
- **Linhas de código (frontend)**: ~2500
- **Número de endpoints**: 28
- **Número de componentes React**: 15+
- **Tempo de desenvolvimento**: 1 sprint
- **Cobertura de testes**: 0% (a implementar)

---

## 🎯 Próximos Milestones

### v1.1.0 - Relatórios Avançados

- Exportação PDF/Excel
- Gráficos de evolução temporal
- Comparação entre períodos

### v1.2.0 - Multi-usuário

- Sistema de autenticação
- Perfis de usuário
- Compartilhamento familiar

### v2.0.0 - Inteligência Artificial

- Categorização automática
- Previsões de gastos
- Sugestões personalizadas

---

**Última atualização:** 06/11/2025
**Status:** ✅ Pronto para uso em produção
