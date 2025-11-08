# MoneyWatch - Sistema de Controle de Gastos Pessoais

![MoneyWatch](https://img.shields.io/badge/MoneyWatch-Controle%20Financeiro-emerald)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248)

Sistema completo de gerenciamento financeiro pessoal desenvolvido com FastAPI (Python), React (JavaScript) e MongoDB.

## 🎯 Funcionalidades

### Gestão Financeira Completa

- ✅ **Dashboard Interativo**: Resumo visual de receitas, despesas e saldo mensal
- ✅ **Categorias Personalizadas**: Organize gastos com ícones customizáveis
- ✅ **Gastos Fixos**: Controle de despesas recorrentes mensais (aluguel, condomínio, etc.)
- ✅ **Gastos Variáveis**: Gerenciamento de compras parceladas e únicas
- ✅ **Receitas**: Registro de múltiplas fontes de renda (recorrentes ou únicas)
- ✅ **Reserva de Emergência**: Controle completo de depósitos e retiradas
- ✅ **Metas de Economia**: Defina e acompanhe objetivos financeiros

### Recursos Avançados

- 💳 **Modal de Pagamento**: Registre forma de pagamento ao marcar despesas como pagas
- 📊 **Análise por Categoria**: Visualize distribuição de gastos com gráficos
- ⚠️ **Alertas de Vencimento**: Notificações para contas próximas do prazo
- 📅 **Filtros por Mês/Ano**: Navegue facilmente entre períodos
- 📱 **Design Responsivo**: Interface moderna adaptável a todos os dispositivos
- 🎨 **UI Premium**: Design elegante com cores e animações suaves

### Correções Implementadas (do TODO.md)

- ✅ Saldo diminui apenas quando despesas são marcadas como 'pago'
- ✅ Gastos fixos são individuais por mês (não afetam meses anteriores/posteriores)
- ✅ Gastos fixos possuem flag 'pendente'/'pago'
- ✅ Modal para marcar despesas como pagas com seleção de forma de pagamento
- ✅ Cálculo correto do saldo total da Reserva de Emergência
- ✅ Tabela de despesas pendentes na tela inicial (Dashboard)

---

## 🚀 Guia de Instalação Local

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/downloads/))
- **MongoDB** 5.0+ ([Download](https://www.mongodb.com/try/download/community))
- **Yarn** (gerenciador de pacotes): `npm install -g yarn`
- **Git** ([Download](https://git-scm.com/))

---

## 📦 Passo a Passo de Instalação

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd app
```

### 2. Configure o MongoDB

#### Opção A: MongoDB Local

**Iniciar MongoDB (Linux/Mac):**

```bash
sudo systemctl start mongodb
# ou
mongod --dbpath /caminho/para/dados
```

**Iniciar MongoDB (Windows):**

```bash
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --dbpath C:\data\db
```

**Criar o banco de dados:**

```bash
mongosh
use controle_gastos
exit
```

#### Opção B: MongoDB Atlas (Nuvem - Grátis)

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um cluster (tier gratuito disponível)
4. Configure acesso de rede (0.0.0.0/0 para desenvolvimento)
5. Crie um usuário do banco
6. Copie a string de conexão

---

### 3. Configurar Backend (FastAPI)

```bash
cd backend
```

**Criar ambiente virtual:**

```bash
# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

**Instalar dependências:**

```bash
pip install -r requirements.txt
```

**Configurar variáveis de ambiente:**

Crie ou edite o arquivo `.env`:

```env
# MongoDB Local
MONGO_URL=mongodb://localhost:27017

# OU MongoDB Atlas
# MONGO_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/

DB_NAME=controle_gastos
CORS_ORIGINS=http://localhost:3000
```

**Iniciar servidor backend:**

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

O backend estará rodando em: `http://localhost:8001`

**Testar API:**

```bash
curl http://localhost:8001/api/
# Resposta esperada: {"message":"Hello World"}
```

---

### 4. Configurar Frontend (React)

Abra um **novo terminal** e navegue até a pasta do frontend:

```bash
cd frontend
```

**Instalar dependências:**

```bash
yarn install
```

**Configurar variáveis de ambiente:**

Crie ou edite o arquivo `.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=0
```

**Iniciar servidor frontend:**

```bash
yarn start
```

O frontend abrirá automaticamente em: `http://localhost:3000`

---

## 🎮 Como Usar

### 1. Criar Categorias

1. Acesse **Categorias** no menu lateral
2. Clique em **Nova Categoria**
3. Escolha um nome e ícone
4. Clique em **Criar**

**Categorias sugeridas:**

- 🏠 Moradia
- 🍔 Alimentação
- 🚗 Transporte
- 💊 Saúde
- 🎮 Lazer
- 💳 Cartões
- 📚 Educação

### 2. Adicionar Receitas

1. Acesse **Receitas** no menu
2. Clique em **Nova Receita**
3. Preencha: nome, valor, data
4. Marque "recorrente" se for mensal (ex: salário)
5. Clique em **Criar**

### 3. Cadastrar Gastos Fixos

1. Acesse **Gastos Fixos**
2. Clique em **Novo Gasto Fixo**
3. Preencha: descrição, categoria, valor, dia do vencimento
4. Clique em **Criar**

**Exemplo:** Aluguel - R$ 1.500,00 - Vence dia 5

### 4. Cadastrar Gastos Variáveis

1. Acesse **Gastos Variáveis**
2. Clique em **Novo Gasto Variável**
3. Preencha: descrição, categoria, valor, data
4. Informe número de parcelas (se aplicável)
5. Clique em **Criar**

### 5. Marcar Despesas como Pagas

**No Dashboard ou nas páginas de gastos:**

1. Localize a despesa pendente
2. Clique em **Marcar como Pago**
3. Selecione a forma de pagamento:
   - 💳 Cartão de Crédito
   - 💳 Cartão de Débito
   - 📱 PIX
   - 💵 Dinheiro
4. Clique em **Confirmar Pagamento**

> ⚠️ **Importante:** O saldo só diminui quando a despesa é marcada como paga!

### 6. Gerenciar Reserva de Emergência

1. Acesse **Reserva de Emergência**
2. Para adicionar: clique em **Adicionar**
3. Para retirar: clique em **Retirar**
4. Informe valor e descrição
5. Confirme a operação

### 7. Criar Metas de Economia

1. Acesse **Metas**
2. Clique em **Nova Meta**
3. Preencha: nome, valor alvo, prazo (opcional)
4. Escolha um ícone
5. Clique em **Criar Meta**

**Contribuir para a meta:**

1. Clique em **Adicionar Contribuição**
2. Informe o valor
3. Confirme

---

## 📊 Estrutura do Projeto

```
app/
├── backend/                    # Backend FastAPI
│   ├── server.py              # API principal com todos os endpoints
│   ├── requirements.txt       # Dependências Python
│   └── .env                   # Variáveis de ambiente (criar)
│
├── frontend/                  # Frontend React
│   ├── public/               # Arquivos estáticos
│   ├── src/
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── Dashboard.js
│   │   │   ├── Categories.js
│   │   │   ├── FixedExpenses.js
│   │   │   ├── VariableExpenses.js
│   │   │   ├── Incomes.js
│   │   │   ├── EmergencyReserve.js
│   │   │   └── SavingsGoals.js
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── Layout.js
│   │   │   ├── PaymentModal.js
│   │   │   ├── StatCard.js
│   │   │   └── ui/          # Componentes Shadcn UI
│   │   ├── App.js           # Componente principal
│   │   ├── App.css          # Estilos globais
│   │   └── index.js         # Entry point
│   ├── package.json         # Dependências Node.js
│   └── .env                 # Variáveis de ambiente (criar)
│
└── README.md                # Este arquivo
```

---

## 🔧 Scripts Úteis

### Backend

```bash
# Ativar ambiente virtual
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar nova dependência
pip install nome-pacote
pip freeze > requirements.txt

# Iniciar com auto-reload
uvicorn server:app --reload --port 8001

# Verificar logs
tail -f /var/log/supervisor/backend.*.log  # Em produção
```

### Frontend

```bash
# Instalar nova dependência
yarn add nome-pacote

# Iniciar em modo desenvolvimento
yarn start

# Criar build de produção
yarn build

# Limpar cache
rm -rf node_modules yarn.lock
yarn install
```

### MongoDB

```bash
# Conectar ao MongoDB local
mongosh

# Listar databases
show dbs

# Usar database
use controle_gastos

# Listar coleções
show collections

# Ver documentos de uma coleção
db.categories.find().pretty()

# Limpar coleção (cuidado!)
db.categories.deleteMany({})

# Backup
mongodump --db controle_gastos --out /caminho/backup

# Restore
mongorestore --db controle_gastos /caminho/backup/controle_gastos
```

---

## 🐛 Solução de Problemas

### Erro: "Cannot connect to MongoDB"

**Solução:**

```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongodb  # Linux

# Iniciar MongoDB
sudo systemctl start mongodb

# Verificar porta
netstat -an | grep 27017
```

### Erro: "CORS policy" no navegador

**Solução:**

No arquivo `backend/.env`, adicione:

```env
CORS_ORIGINS=http://localhost:3000
```

Reinicie o backend.

### Erro: "Module not found" no React

**Solução:**

```bash
cd frontend
rm -rf node_modules package-lock.json
yarn install
```

### Erro: "Port 3000 already in use"

**Solução:**

```bash
# Encontrar processo
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Matar processo
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Ou usar outra porta
PORT=3001 yarn start
```

### Frontend não conecta ao Backend

**Verificar:**

1. Backend está rodando? `curl http://localhost:8001/api/`
2. `.env` do frontend está correto?
3. CORS configurado no backend?

---

## 🧪 Testando a Aplicação

### Teste Manual Completo

1. **Criar 3 categorias**: Moradia, Alimentação, Transporte
2. **Adicionar 1 receita**: Salário - R$ 5.000,00
3. **Criar 2 gastos fixos**:
   - Aluguel (Moradia) - R$ 1.500,00 - Dia 5
   - Internet (Moradia) - R$ 100,00 - Dia 10
4. **Criar 1 gasto variável**: Supermercado (Alimentação) - R$ 300,00
5. **Marcar aluguel como pago** (Cartão de Crédito)
6. **Verificar Dashboard**:
   - Receitas: R$ 5.000,00
   - Despesas: R$ 1.500,00 (apenas o pago)
   - Saldo: R$ 3.500,00
   - Pendentes: Internet e Supermercado
7. **Adicionar à reserva**: R$ 500,00
8. **Criar meta**: Viagem - R$ 2.000,00
9. **Contribuir para meta**: R$ 200,00

### Testar API com cURL

```bash
# Listar categorias
curl http://localhost:8001/api/categories

# Criar categoria
curl -X POST http://localhost:8001/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste", "icon": "🎯"}'

# Dashboard
curl "http://localhost:8001/api/dashboard?month=11&year=2025"

# Saldo da reserva
curl http://localhost:8001/api/emergency-reserve/balance
```

---

## 📱 Características Técnicas

### Backend (FastAPI)

- **Framework**: FastAPI 0.110.1
- **Database**: MongoDB com Motor (async)
- **Validação**: Pydantic v2
- **CORS**: Configurável via ambiente
- **Arquitetura**: RESTful API com prefixo `/api`

**Principais Endpoints:**

```
GET    /api/                           # Health check
GET    /api/dashboard?month=X&year=Y   # Dashboard summary

# Categories
GET    /api/categories
POST   /api/categories
DELETE /api/categories/{id}

# Fixed Expenses
GET    /api/fixed-expenses?month=X&year=Y
POST   /api/fixed-expenses
PUT    /api/fixed-expenses/{id}
POST   /api/fixed-expenses/{id}/mark-paid
DELETE /api/fixed-expenses/{id}

# Variable Expenses
GET    /api/variable-expenses?month=X&year=Y
POST   /api/variable-expenses
PUT    /api/variable-expenses/{id}
POST   /api/variable-expenses/{id}/mark-paid
DELETE /api/variable-expenses/{id}

# Incomes
GET    /api/incomes?month=X&year=Y
POST   /api/incomes
PUT    /api/incomes/{id}
DELETE /api/incomes/{id}

# Emergency Reserve
GET    /api/emergency-reserve
GET    /api/emergency-reserve/balance
POST   /api/emergency-reserve
DELETE /api/emergency-reserve/{id}

# Savings Goals
GET    /api/savings-goals
POST   /api/savings-goals
PUT    /api/savings-goals/{id}
DELETE /api/savings-goals/{id}
GET    /api/savings-goals/{id}/contributions
POST   /api/savings-goals/{id}/contributions
```

### Frontend (React)

- **Framework**: React 19
- **Roteamento**: React Router v7
- **Requisições HTTP**: Axios
- **UI Components**: Shadcn/UI + Radix UI
- **Estilos**: TailwindCSS
- **Notificações**: Sonner
- **Fontes**: Space Grotesk (títulos) + Inter (texto)

---

## 🎨 Personalização

### Alterar Cores do Tema

Edite `/app/frontend/src/App.css`:

```css
/* Cor principal (verde) */
.bg-emerald-500 {
  background: #10b981;
}

/* Para mudar para azul */
.bg-emerald-500 {
  background: #3b82f6;
}
```

### Adicionar Nova Categoria de Ícone

Edite `/app/frontend/src/pages/Categories.js`:

```javascript
const commonIcons = [
  "🏠",
  "💼",
  "👗",
  "📚",
  "🎲",
  "🍽️",
  "🚗",
  "🛍️",
  "🍔",
  "🐶",
  "🎮",
  "🎬",
  "❤️‍🩹",
  "💳",
  "📊",
  "🎯",
  "✈️",
  "🏥",
  "⚡",
  "📱", // Adicione aqui
];
```

---

## 🔐 Segurança

### Para Produção

1. **Altere CORS**: Remova `*` e especifique domínios
2. **Use HTTPS**: Configure certificado SSL
3. **Autenticação**: Implemente JWT ou OAuth
4. **Variáveis de ambiente**: Use secrets manager
5. **MongoDB**: Configure usuário e senha fortes
6. **Rate limiting**: Limite requisições por IP

---

## 📄 Licença

MIT License - Veja o arquivo LICENSE para detalhes.

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas ou problemas:

- Abra uma issue no repositório
- Envie email para: suporte@moneywatch.com

---

**Desenvolvido com ❤️ para ajudar você a ter controle total das suas finanças!**

---

## 📝 Changelog

### v1.0.0 (2025-11-06)

#### Implementado

- ✅ Sistema completo de categorias
- ✅ Gestão de gastos fixos por mês
- ✅ Gestão de gastos variáveis com parcelas
- ✅ Controle de receitas
- ✅ Reserva de emergência com histórico
- ✅ Metas de economia com contribuições
- ✅ Dashboard com análise por categoria
- ✅ Modal de pagamento
- ✅ Alertas de vencimento
- ✅ Filtros por mês/ano
- ✅ Design responsivo

#### Corrigido

- ✅ Saldo agora diminui apenas com despesas pagas
- ✅ Gastos fixos independentes por mês
- ✅ Sistema de status pendente/pago implementado
- ✅ Cálculo correto da reserva de emergência
- ✅ Tabela de pendentes no dashboard
