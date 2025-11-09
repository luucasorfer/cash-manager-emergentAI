#!/bin/bash

echo "=========================================="
echo "Cash Manager - Setup MySQL"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Instalar MySQL
echo -e "${YELLOW}[1/5] Instalando MySQL...${NC}"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server > /dev/null 2>&1
sudo systemctl start mysql
echo -e "${GREEN}✓ MySQL instalado${NC}"
echo ""

# 2. Criar banco de dados
echo -e "${YELLOW}[2/5] Configurando banco de dados...${NC}"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS cash_manager;" 2>/dev/null
sudo mysql -e "CREATE USER IF NOT EXISTS 'cashuser'@'localhost' IDENTIFIED BY 'cashpass123';" 2>/dev/null
sudo mysql -e "GRANT ALL PRIVILEGES ON cash_manager.* TO 'cashuser'@'localhost';" 2>/dev/null
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null
echo -e "${GREEN}✓ Banco de dados configurado${NC}"
echo ""

# 3. Instalar dependências Python
echo -e "${YELLOW}[3/5] Instalando dependências Python...${NC}"
cd backend
sudo pip3 install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✓ Dependências instaladas${NC}"
echo ""

# 4. Verificar configuração
echo -e "${YELLOW}[4/5] Verificando configuração...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Arquivo .env encontrado${NC}"
else
    echo -e "${YELLOW}! Criando arquivo .env${NC}"
    echo 'DATABASE_URL="mysql+aiomysql://cashuser:cashpass123@localhost/cash_manager"' > .env
    echo 'CORS_ORIGINS="*"' >> .env
fi
echo ""

# 5. Testar conexão
echo -e "${YELLOW}[5/5] Testando conexão com MySQL...${NC}"
if sudo mysql -e "USE cash_manager; SHOW TABLES;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conexão com MySQL OK${NC}"
else
    echo -e "${RED}✗ Erro ao conectar com MySQL${NC}"
    exit 1
fi
echo ""

echo "=========================================="
echo -e "${GREEN}Setup concluído com sucesso!${NC}"
echo "=========================================="
echo ""
echo "Para iniciar o servidor, execute:"
echo "  cd backend"
echo "  python3 server.py"
echo ""
echo "O servidor estará disponível em:"
echo "  http://localhost:8000"
echo ""
