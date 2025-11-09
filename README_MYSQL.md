# Cash Manager - Versão MySQL

Sistema de gerenciamento financeiro pessoal com backend em FastAPI e MySQL.

## 🔄 Migração para MySQL

Este projeto foi **migrado de MongoDB para MySQL**. Para detalhes completos sobre a migração, consulte o arquivo [MIGRACAO_MYSQL.md](./MIGRACAO_MYSQL.md).

## 🗄️ Banco de Dados

- **SGBD:** MySQL 8.0+
- **ORM:** SQLAlchemy (async)
- **Driver:** aiomysql + pymysql

### Tabelas

1. `categories` - Categorias de despesas
2. `fixed_expense_templates` - Templates de despesas fixas
3. `fixed_expenses_months` - Despesas fixas mensais
4. `variable_expenses` - Despesas variáveis
5. `incomes` - Receitas
6. `emergency_reserve` - Reserva de emergência
7. `savings_goals` - Metas de economia
8. `goal_contributions` - Contribuições para metas

## 🚀 Instalação

### 1. Pré-requisitos

- Python 3.11+
- MySQL 8.0+
- pip3

### 2. Configurar MySQL

```bash
# Instalar MySQL
sudo apt-get update
sudo apt-get install -y mysql-server

# Iniciar MySQL
sudo systemctl start mysql

# Criar banco de dados e usuário
sudo mysql -e "CREATE DATABASE IF NOT EXISTS cash_manager;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'cashuser'@'localhost' IDENTIFIED BY 'cashpass123';"
sudo mysql -e "GRANT ALL PRIVILEGES ON cash_manager.* TO 'cashuser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 3. Instalar Dependências Python

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `backend/.env`:

```env
DATABASE_URL="mysql+aiomysql://cashuser:cashpass123@localhost/cash_manager"
CORS_ORIGINS="*"
```

### 5. Executar o Backend

```bash
cd backend
python3 server.py
```

O servidor estará disponível em: `http://localhost:8000`

## 📡 API Endpoints

### Categorias

- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `DELETE /api/categories/{id}` - Deletar categoria

### Despesas Fixas (Templates)

- `GET /api/fixed-expense-templates` - Listar templates
- `POST /api/fixed-expense-templates` - Criar template
- `PUT /api/fixed-expense-templates/{id}` - Atualizar template
- `DELETE /api/fixed-expense-templates/{id}` - Deletar template

### Despesas Fixas (Mensais)

- `GET /api/fixed-expenses` - Listar despesas fixas
- `POST /api/fixed-expenses` - Criar despesa fixa
- `PUT /api/fixed-expenses/{id}` - Atualizar despesa fixa
- `POST /api/fixed-expenses/{id}/mark-as-paid` - Marcar como paga
- `DELETE /api/fixed-expenses/{id}` - Deletar despesa fixa

### Despesas Variáveis

- `GET /api/variable-expenses` - Listar despesas variáveis
- `POST /api/variable-expenses` - Criar despesa variável
- `PUT /api/variable-expenses/{id}` - Atualizar despesa variável
- `POST /api/variable-expenses/{id}/mark-as-paid` - Marcar como paga
- `DELETE /api/variable-expenses/{id}` - Deletar despesa variável

### Receitas

- `GET /api/incomes` - Listar receitas
- `POST /api/incomes` - Criar receita
- `PUT /api/incomes/{id}` - Atualizar receita
- `DELETE /api/incomes/{id}` - Deletar receita

### Reserva de Emergência

- `GET /api/emergency-reserve` - Listar reservas
- `GET /api/emergency-reserve/total` - Total da reserva
- `POST /api/emergency-reserve` - Adicionar à reserva
- `DELETE /api/emergency-reserve/{id}` - Deletar reserva

### Metas de Economia

- `GET /api/savings-goals` - Listar metas
- `POST /api/savings-goals` - Criar meta
- `PUT /api/savings-goals/{id}` - Atualizar meta
- `DELETE /api/savings-goals/{id}` - Deletar meta
- `GET /api/savings-goals/{id}/contributions` - Listar contribuições
- `POST /api/savings-goals/{id}/contributions` - Adicionar contribuição
- `DELETE /api/savings-goals/{id}/contributions/{contribution_id}` - Deletar contribuição

### Dashboard

- `GET /api/dashboard?month={month}&year={year}` - Resumo financeiro

## 🧪 Exemplos de Uso

### Criar uma categoria

```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Alimentação", "icon": "🍔"}'
```

### Criar uma receita

```bash
curl -X POST http://localhost:8000/api/incomes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salário",
    "amount": 5000.00,
    "date": "2025-11-01T00:00:00Z",
    "is_recurring": true
  }'
```

### Criar uma despesa variável

```bash
curl -X POST http://localhost:8000/api/variable-expenses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Compras no Mercado",
    "category_id": "166633ef-8233-43c7-81b2-3ee3d815698a",
    "amount": 350.00,
    "date": "2025-11-08T00:00:00Z",
    "payment_method": "debit",
    "installments": 1
  }'
```

### Obter dashboard do mês

```bash
curl -X GET "http://localhost:8000/api/dashboard?month=11&year=2025"
```

## 🔧 Tecnologias Utilizadas

### Backend

- **FastAPI** - Framework web assíncrono
- **SQLAlchemy** - ORM para Python
- **aiomysql** - Driver MySQL assíncrono
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

### Banco de Dados

- **MySQL 8.0** - Sistema de gerenciamento de banco de dados relacional

## 📁 Estrutura do Projeto

```
cash-manager-emergentAI/
├── backend/
│   ├── server.py                      # Servidor FastAPI com MySQL
│   ├── server_mongodb_original.py     # Backup do código original (MongoDB)
│   ├── requirements.txt               # Dependências Python
│   └── .env                           # Variáveis de ambiente
├── frontend/                          # Frontend (não modificado)
├── MIGRACAO_MYSQL.md                  # Documentação da migração
├── README_MYSQL.md                    # Este arquivo
└── README.md                          # README original
```

## 🔐 Segurança

⚠️ **IMPORTANTE:** As credenciais padrão do MySQL são apenas para desenvolvimento local. Em produção:

1. Use senhas fortes e únicas
2. Configure SSL/TLS para conexões com o banco
3. Use variáveis de ambiente seguras
4. Implemente autenticação e autorização na API
5. Configure CORS adequadamente

## 📝 Licença

Este projeto mantém a licença original do repositório base.

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para problemas ou dúvidas:

- Abra uma issue no GitHub
- Consulte a documentação em [MIGRACAO_MYSQL.md](./MIGRACAO_MYSQL.md)

---

**Versão:** 2.0 (MySQL)  
**Data:** Novembro 2025  
**Migrado de:** MongoDB para MySQL
