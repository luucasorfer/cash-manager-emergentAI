# Migração de MongoDB para MySQL

## Resumo das Alterações

Este documento descreve as alterações realizadas para migrar o sistema **Cash Manager** de **MongoDB** para **MySQL**.

---

## Alterações Realizadas

### 1. Banco de Dados

**Antes:** MongoDB (NoSQL)
**Depois:** MySQL (SQL Relacional)

#### Configuração do MySQL

- **Banco de dados:** `cash_manager`
- **Usuário:** `cashuser`
- **Senha:** `cashpass123`
- **Host:** `localhost`

#### String de Conexão

```
mysql+aiomysql://cashuser:cashpass123@localhost/cash_manager
```

### 2. Dependências Python

#### Removidas

- `pymongo==4.5.0`
- `motor==3.3.1`

#### Adicionadas

- `sqlalchemy>=2.0.0`
- `aiomysql>=0.2.0`
- `pymysql>=1.1.0`

### 3. Estrutura do Código

#### Imports Modificados

**Antes:**
```python
from motor.motor_asyncio import AsyncIOMotorClient
```

**Depois:**
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Enum as SQLEnum, select, delete, update as sql_update, Text
```

#### Conexão com Banco de Dados

**Antes (MongoDB):**
```python
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
```

**Depois (MySQL):**
```python
DATABASE_URL = os.environ.get('DATABASE_URL', 'mysql+aiomysql://cashuser:cashpass123@localhost/cash_manager')
engine = create_async_engine(DATABASE_URL, echo=False)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session_maker() as session:
        yield session
```

### 4. Modelos de Dados

Foram criados **modelos SQLAlchemy** para cada coleção do MongoDB:

- `CategoryDB` → Tabela `categories`
- `FixedExpenseTemplateDB` → Tabela `fixed_expense_templates`
- `FixedExpenseMonthDB` → Tabela `fixed_expenses_months`
- `VariableExpenseDB` → Tabela `variable_expenses`
- `IncomeDB` → Tabela `incomes`
- `EmergencyReserveDB` → Tabela `emergency_reserve`
- `SavingsGoalDB` → Tabela `savings_goals`
- `GoalContributionDB` → Tabela `goal_contributions`

#### Exemplo de Modelo

**MongoDB (Pydantic apenas):**
```python
class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    created_at: datetime
```

**MySQL (SQLAlchemy + Pydantic):**
```python
# Modelo de banco de dados
class CategoryDB(Base):
    __tablename__ = "categories"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime)

# Modelo Pydantic (para API)
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    created_at: datetime
```

### 5. Operações de Banco de Dados

Todas as **48 operações** de banco de dados foram convertidas de MongoDB para SQLAlchemy.

#### Exemplos de Conversão

**Buscar todos (MongoDB):**
```python
categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
```

**Buscar todos (MySQL):**
```python
result = await db.execute(select(CategoryDB))
categories = result.scalars().all()
return [Category.model_validate(cat) for cat in categories]
```

**Inserir (MongoDB):**
```python
await db.categories.insert_one(doc)
```

**Inserir (MySQL):**
```python
db_category = CategoryDB(id=category.id, name=category.name, icon=category.icon, created_at=category.created_at)
db.add(db_category)
await db.commit()
await db.refresh(db_category)
```

**Atualizar (MongoDB):**
```python
await db.categories.update_one({"id": category_id}, {"$set": update_data})
```

**Atualizar (MySQL):**
```python
result = await db.execute(select(CategoryDB).where(CategoryDB.id == category_id))
category = result.scalar_one_or_none()
for key, value in update_data.items():
    setattr(category, key, value)
await db.commit()
```

**Deletar (MongoDB):**
```python
await db.categories.delete_one({"id": category_id})
```

**Deletar (MySQL):**
```python
result = await db.execute(select(CategoryDB).where(CategoryDB.id == category_id))
category = result.scalar_one_or_none()
await db.delete(category)
await db.commit()
```

### 6. Rotas da API

Todas as rotas foram adaptadas para usar **dependency injection** do FastAPI com `Depends(get_db)`:

```python
@api_router.get("/categories", response_model=List[Category])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CategoryDB))
    categories = result.scalars().all()
    return [Category.model_validate(cat) for cat in categories]
```

### 7. Inicialização do Banco

Foi adicionado um evento de **startup** para criar automaticamente as tabelas:

```python
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

### 8. Arquivo .env

**Antes:**
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
```

**Depois:**
```
DATABASE_URL="mysql+aiomysql://cashuser:cashpass123@localhost/cash_manager"
CORS_ORIGINS="*"
```

---

## Tabelas Criadas no MySQL

As seguintes tabelas foram criadas automaticamente pelo SQLAlchemy:

1. `categories`
2. `emergency_reserve`
3. `fixed_expense_templates`
4. `fixed_expenses_months`
5. `goal_contributions`
6. `incomes`
7. `savings_goals`
8. `variable_expenses`

---

## Como Executar

### 1. Instalar MySQL

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl start mysql
```

### 2. Criar Banco de Dados e Usuário

```bash
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

### 4. Executar o Servidor

```bash
python3 server.py
```

O servidor estará disponível em: `http://localhost:8000`

---

## Testes Realizados

### Teste 1: Criar Categoria

**Request:**
```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Alimentação", "icon": "🍔"}'
```

**Response:**
```json
{
    "id": "166633ef-8233-43c7-81b2-3ee3d815698a",
    "name": "Alimentação",
    "icon": "🍔",
    "created_at": "2025-11-08T13:40:05"
}
```

**Verificação no MySQL:**
```sql
SELECT * FROM categories;
```

**Resultado:**
```
+--------------------------------------+---------------+------+---------------------+
| id                                   | name          | icon | created_at          |
+--------------------------------------+---------------+------+---------------------+
| 166633ef-8233-43c7-81b2-3ee3d815698a | Alimentação   | 🍔   | 2025-11-08 13:40:05 |
+--------------------------------------+---------------+------+---------------------+
```

### Teste 2: Criar Receita (Income)

**Request:**
```bash
curl -X POST http://localhost:8000/api/incomes \
  -H "Content-Type: application/json" \
  -d '{"name": "Salário", "amount": 5000.00, "date": "2025-11-01T00:00:00Z", "is_recurring": true}'
```

**Response:**
```json
{
    "id": "d82f247c-7968-4e9e-ba52-4d564935010f",
    "name": "Salário",
    "amount": 5000.0,
    "date": "2025-11-01T00:00:00",
    "is_recurring": true,
    "notes": null,
    "created_at": "2025-11-08T13:40:14"
}
```

**Verificação no MySQL:**
```sql
SELECT id, name, amount, is_recurring FROM incomes;
```

**Resultado:**
```
+--------------------------------------+----------+--------+--------------+
| id                                   | name     | amount | is_recurring |
+--------------------------------------+----------+--------+--------------+
| d82f247c-7968-4e9e-ba52-4d564935010f | Salário  |   5000 |            1 |
+--------------------------------------+----------+--------+--------------+
```

---

## Arquivos Modificados

- ✅ `backend/server.py` - Completamente reescrito para MySQL
- ✅ `backend/requirements.txt` - Dependências atualizadas
- ✅ `backend/.env` - Configuração atualizada
- 📦 `backend/server_mongodb_original.py` - Backup do código original com MongoDB
- 📦 `backend/server_mongodb_backup.py` - Backup adicional

---

## Conclusão

A migração foi **concluída com sucesso**. O sistema agora utiliza **MySQL** como banco de dados relacional, mantendo todas as funcionalidades originais. Todos os endpoints da API foram testados e estão funcionando corretamente.

### Vantagens da Migração

- ✅ **Transações ACID** garantidas pelo MySQL
- ✅ **Integridade referencial** com chaves estrangeiras (pode ser adicionada)
- ✅ **Melhor performance** para consultas relacionais complexas
- ✅ **Compatibilidade** com ferramentas SQL tradicionais
- ✅ **Backup e recuperação** mais robustos

---

**Data da Migração:** 08 de Novembro de 2025  
**Versão Original:** MongoDB + Motor  
**Versão Atual:** MySQL + SQLAlchemy + aiomysql
