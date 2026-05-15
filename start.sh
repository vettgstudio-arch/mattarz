#!/bin/bash

# ========================================
# Mattarz Investimentos - Auto Launcher
# ========================================
# Este script inicia automaticamente o app

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     MATTARZ INVESTIMENTOS - Sistema de Gestão Comercial    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Erro: Node.js não está instalado!${NC}"
    echo -e "${YELLOW}Por favor, instale Node.js em: https://nodejs.org/${NC}"
    exit 1
fi

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠ pnpm não encontrado. Instalando globalmente...${NC}"
    npm install -g pnpm
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}→ Instalando dependências do projeto...${NC}"
    pnpm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Erro ao instalar dependências!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Ambiente verificado com sucesso!${NC}"
echo ""
echo -e "${BLUE}→ Iniciando servidor de desenvolvimento...${NC}"
echo -e "${YELLOW}→ Acesse: http://localhost:3000${NC}"
echo ""

# Exportar variáveis de ambiente
export NODE_ENV=development
export PORT=3000
export OAUTH_SERVER_URL=http://localhost:3000

# Sincronizar banco de dados antes de iniciar
echo -e "${BLUE}→ Sincronizando banco de dados...${NC}"
pnpm db:push

# Iniciar o servidor
pnpm dev

# Se o servidor encerrar, mostrar mensagem
echo ""
echo -e "${YELLOW}⚠ Servidor encerrado.${NC}"
