# 🚀 Guia Rápido de Instalação - MoneyWatch

## ⚡ Instalação Express (5 minutos)

### Pré-requisitos

✅ Node.js 18+
✅ Python 3.9+
✅ MongoDB
✅ Yarn

### Passo 1: MongoDB

**Opção A - Local:**

```bash
sudo systemctl start mongodb
mongosh
use controle_gastos
exit
```

**Opção B - Atlas (Nuvem Grátis):**

1. Criar conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Criar cluster gratuito
3. Copiar string de conexão

### Passo 2: Backend

```bash
cd backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
echo 'MONGO_URL=mongodb://localhost:27017' > .env
echo 'DB_NAME=controle_gastos' >> .env
echo 'CORS_ORIGINS=http://localhost:3000' >> .env

# Iniciar servidor
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

✅ Backend rodando em: `http://localhost:8001`

### Passo 3: Frontend

**Abra um NOVO terminal:**

```bash
cd frontend

# Instalar dependências
yarn install

# Configurar .env
echo 'REACT_APP_BACKEND_URL=http://localhost:8001' > .env
echo 'WDS_SOCKET_PORT=0' >> .env

# Iniciar aplicação
yarn start
```

✅ Frontend abrirá em: `http://localhost:3000`

---

## 🎯 Primeiro Uso

1. **Criar categorias**: Acesse "Categorias" → Nova Categoria
2. **Adicionar receita**: Acesse "Receitas" → Nova Receita
3. **Cadastrar gastos**: Acesse "Gastos Fixos" ou "Gastos Variáveis"
4. **Marcar como pago**: No Dashboard, clique em "Marcar como Pago"
5. **Ver relatórios**: Dashboard mostra gráficos e resumo

---

## 🔧 Comandos Rápidos

### Iniciar Tudo

**Terminal 1 - Backend:**

```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload --port 8001
```

**Terminal 2 - Frontend:**

```bash
cd frontend
yarn start
```

### Parar Tudo

- Backend: `Ctrl + C` no terminal 1
- Frontend: `Ctrl + C` no terminal 2
- MongoDB: `sudo systemctl stop mongodb`

---

## 🐛 Problemas Comuns

### ❌ "Cannot connect to MongoDB"

```bash
sudo systemctl start mongodb
sudo systemctl status mongodb
```

### ❌ "Port 8001 already in use"

```bash
lsof -i :8001
kill -9 <PID>
```

### ❌ "Port 3000 already in use"

```bash
lsof -i :3000
kill -9 <PID>
```

### ❌ "Module not found" no React

```bash
cd frontend
rm -rf node_modules yarn.lock
yarn install
```

### ❌ "CORS error" no navegador

Verifique `backend/.env`:

```env
CORS_ORIGINS=http://localhost:3000
```

---

## 📱 Testar se Está Funcionando

### Teste Backend

```bash
curl http://localhost:8001/api/
# Esperado: {"message":"Hello World"}
```

### Teste Frontend

Abra navegador: `http://localhost:3000`

Deve aparecer a interface do MoneyWatch.

---

## 📊 Próximos Passos

1. ✅ Leia o [README.md](README.md) completo
2. ✅ Configure suas categorias
3. ✅ Adicione suas receitas e despesas
4. ✅ Explore todas as funcionalidades

---

## 💡 Dicas

- 🔄 Backend com `--reload` reinicia automaticamente ao editar código
- 🔄 Frontend também tem hot-reload ativado
- 💾 Dados ficam salvos no MongoDB
- 📂 Faça backups periódicos: `mongodump --db controle_gastos`

---

**Precisa de mais ajuda?** Consulte o [README.md](README.md) completo!
