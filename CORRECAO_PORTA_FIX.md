# 🔧 Correção de Erros - Mattarz Investimentos Premium v5

## Erro 1: ERR_CONNECTION_REFUSED (RESOLVIDO ✅)

### Problema Identificado
O seu projeto estava apresentando o erro **`ERR_CONNECTION_REFUSED`** ao tentar aceder a `localhost:5173`.

### Causa Raiz
Havia uma **incompatibilidade entre as portas configuradas**:
1. Documentação e scripts apontavam para: `http://localhost:5173` (porta Vite)
2. Servidor Express realmente iniciava em: `http://localhost:3000`
3. Não havia proxy entre as duas portas

### Solução Aplicada
- ✅ **start.bat** (Windows): Adicionada variável `PORT=3000` e alterada URL de abertura
- ✅ **start.sh** (macOS/Linux): Adicionadas variáveis de ambiente necessárias
- ✅ **.env.example**: Substituída `API_PORT` por `PORT` (alinhado com código)

---

## Erro 2: TypeError - URL inválida (RESOLVIDO ✅)

### Problema Identificado
Após resolver o primeiro erro, surgiu:
```
TypeError: URL inválida
    em getLoginUrl (http://localhost:3000/src/const.ts:7:15)
```

### Causa Raiz
As variáveis de ambiente **`VITE_OAUTH_PORTAL_URL`** e **`VITE_APP_ID`** não estavam definidas no ficheiro `.env`.

O código tentava construir a URL de login com valores `undefined`, causando o erro.

### Solução Aplicada

#### 1. **Novos ficheiros de configuração**
- ✅ **.env.example**: Adicionadas todas as variáveis `VITE_*` necessárias
- ✅ **.env.development**: Novo ficheiro com valores padrão para desenvolvimento

#### 2. **Melhorias no código**
- ✅ **client/src/const.ts**: Adicionada validação de variáveis de ambiente com mensagens de erro claras

---

## Como Usar - Passo a Passo

### 1️⃣ Configurar o Ambiente

**Windows:**
```batch
# Copiar o ficheiro de exemplo
copy .env.development .env

# Ou editar manualmente
notepad .env
```

**macOS/Linux:**
```bash
# Copiar o ficheiro de exemplo
cp .env.development .env

# Ou editar manualmente
nano .env
```

### 2️⃣ Definir as Variáveis Críticas

No ficheiro `.env`, certifique-se de que tem:

```env
# Porta do servidor
PORT=3000
NODE_ENV=development

# Autenticação OAuth (CRÍTICO)
VITE_OAUTH_PORTAL_URL=http://localhost:3000
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=http://localhost:3000

# Banco de dados
DATABASE_URL=mysql://root:password@localhost:3306/mattarz

# Chaves de segurança
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_min_32_caracteres
SESSION_SECRET=outra_chave_secreta_aqui
```

### 3️⃣ Iniciar o Servidor

**Windows:**
```batch
start.bat
```

**macOS/Linux:**
```bash
./start.sh
```

O servidor deve agora iniciar sem erros em: **http://localhost:3000**

---

## Variáveis de Ambiente Explicadas

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta do servidor Express | `3000` |
| `NODE_ENV` | Ambiente (development/production) | `development` |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de autenticação | `http://localhost:3000` |
| `VITE_APP_ID` | ID da aplicação no portal OAuth | `dev-app-id-12345` |
| `OAUTH_SERVER_URL` | URL do servidor OAuth (backend) | `http://localhost:3000` |
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Chave para assinar JWT (min 32 chars) | `chave-super-secreta-aqui` |

---

## Troubleshooting

### "URL inválida" ou "VITE_OAUTH_PORTAL_URL não definida"
- ✅ Verifique se o ficheiro `.env` existe na raiz do projeto
- ✅ Verifique se `VITE_OAUTH_PORTAL_URL` está definida
- ✅ Reinicie o servidor após editar `.env`

### "Port 3000 is busy"
- O servidor tentará automaticamente as portas 3001, 3002, etc.
- Ou mate o processo que está usando a porta 3000

### "Cannot find module" ou "node_modules não encontrado"
```bash
pnpm install
```

### "Database connection error"
- Verifique se MySQL está a correr
- Verifique a string `DATABASE_URL` em `.env`

---

## Resumo das Mudanças

| Ficheiro | Alteração |
|----------|-----------|
| `start.bat` | Porta 5173 → 3000, adicionada `PORT=3000` |
| `start.sh` | Porta 5173 → 3000, adicionadas variáveis de ambiente |
| `.env.example` | Adicionadas variáveis `VITE_*` e `OAUTH_*` |
| `.env.development` | **NOVO**: Valores padrão para desenvolvimento |
| `client/src/const.ts` | Adicionada validação com mensagens de erro claras |

---

## Próximas Etapas

1. Copie `.env.development` para `.env`
2. Edite as variáveis conforme necessário (especialmente `VITE_APP_ID`)
3. Execute `start.bat` ou `./start.sh`
4. Aceda a `http://localhost:3000`

---

**Data da Correção**: Maio 2026  
**Versão**: Premium v5  
**Status**: ✅ Totalmente Corrigido
