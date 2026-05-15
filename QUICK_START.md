# 🚀 Guia de Início Rápido

## Windows

### Opção 1: Automática (Recomendado)
1. **Duplo clique** em `start.bat`
2. Aguarde a instalação (primeira execução pode levar alguns minutos)
3. O navegador abrirá automaticamente em `http://localhost:5173`

### Opção 2: Manual
```bash
# Abra o Prompt de Comando (CMD) na pasta do projeto
pnpm install
pnpm dev
```

## macOS / Linux

### Opção 1: Automática (Recomendado)
```bash
chmod +x start.sh
./start.sh
```

### Opção 2: Manual
```bash
pnpm install
pnpm dev
```

## Acesso Inicial

- **URL**: http://localhost:5173
- **Usuário Padrão**: admin@mattarz.com
- **Senha Padrão**: Admin@123456

> ⚠️ **Importante**: Altere a senha na primeira execução!

## Requisitos Mínimos

- Node.js v18+
- RAM: 2GB
- Espaço em disco: 500MB
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## Solução de Problemas

### Porta 5173 já em uso
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

### Erro de dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro de banco de dados
Verifique se MySQL está rodando e configure `.env` corretamente

## Próximos Passos

1. ✅ Altere a senha do admin
2. ✅ Configure suas informações de empresa
3. ✅ Crie usuários para sua equipe
4. ✅ Importe dados existentes
5. ✅ Personalize os relatórios

## Suporte

- 📧 Email: suporte@mattarzinvestimentos.com
- 📖 Documentação: Veja `README_PREMIUM.md`
- 💬 Chat: Disponível no app

---

**Bem-vindo ao Mattarz Investimentos Premium! 🎉**
