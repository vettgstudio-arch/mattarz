# 🚀 Mattarz Investimentos - Edição Premium

Sistema de gestão comercial avançado com análise de dados em tempo real, relatórios inteligentes e interface moderna.

## ✨ Recursos Premium

### 📊 Dashboard Inteligente
- **KPIs Customizáveis**: Crie e personalize indicadores-chave de desempenho
- **Análise em Tempo Real**: Visualize dados atualizados instantaneamente
- **Gráficos Interativos**: Múltiplos tipos de visualização (barras, linhas, pizza, área)
- **Alertas Automáticos**: Notificações de eventos importantes

### 📈 Relatórios Avançados
- **Exportação em Múltiplos Formatos**: PDF, Excel, CSV
- **Relatórios Agendados**: Configure relatórios automáticos por email
- **Análise Comparativa**: Compare períodos e identifique tendências
- **Previsões**: Projeções baseadas em dados históricos

### 👥 Gestão de Usuários
- **Autenticação Segura**: Login com 2FA (autenticação de dois fatores)
- **Controle de Acesso**: Permissões granulares por função
- **Auditoria Completa**: Rastreie todas as ações dos usuários
- **Perfis Customizáveis**: Crie roles específicas para seu negócio

### 💼 Gestão de Vendas
- **Pipeline de Vendas**: Acompanhe oportunidades em tempo real
- **Comissões Automáticas**: Cálculo automático de comissões por vendedor
- **Histórico Completo**: Rastreie todas as transações
- **Integração com CRM**: Sincronize dados de clientes

### 📦 Gestão de Estoque
- **Controle Inteligente**: Alertas de estoque baixo e vencimento
- **Movimentação Automática**: Registre entradas e saídas automaticamente
- **Código de Barras**: Leitura rápida de produtos
- **Previsão de Demanda**: Sugestões de reposição baseadas em histórico

### 💰 Gestão Financeira
- **Contas a Receber**: Controle de parcelas e inadimplência
- **Contas a Pagar**: Gestão de despesas e fornecedores
- **Fluxo de Caixa**: Projeção de caixa com cenários
- **Integração Bancária**: Sincronize com sua conta bancária

### 📱 Interface Moderna
- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Temas Personalizáveis**: Modo claro, escuro e customizado
- **Atalhos de Teclado**: Produtividade aumentada
- **Sincronização em Nuvem**: Acesse de qualquer lugar

### 🔒 Segurança
- **Criptografia End-to-End**: Seus dados protegidos
- **Backup Automático**: Backup diário em nuvem
- **Recuperação de Desastres**: Restaure dados em minutos
- **Conformidade LGPD**: Atende às regulamentações brasileiras

### 🤖 Automações
- **Workflows Personalizados**: Automatize processos repetitivos
- **Integração com APIs**: Conecte com outros sistemas
- **Webhooks**: Dispare ações em tempo real
- **Agendamentos**: Configure tarefas para rodar automaticamente

## 🚀 Como Usar

### Windows
1. **Duplo clique** em `start.bat`
2. Aguarde a instalação das dependências (primeira execução)
3. O navegador abrirá automaticamente em `http://localhost:5173`

### macOS / Linux
```bash
./start.sh
```

### Acesso Manual
Se preferir iniciar manualmente:

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm dev

# Ou para produção
pnpm build
pnpm start
```

## 📋 Requisitos

- **Node.js**: v18 ou superior
- **pnpm**: v10 ou superior
- **Navegador**: Chrome, Firefox, Safari ou Edge (versão recente)
- **RAM**: Mínimo 2GB
- **Espaço em Disco**: Mínimo 500MB

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/mattarz

# API
API_PORT=3000
API_HOST=localhost

# Autenticação
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d

# Email (para relatórios agendados)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app

# AWS S3 (para backup)
AWS_ACCESS_KEY_ID=sua_chave
AWS_SECRET_ACCESS_KEY=sua_chave_secreta
AWS_REGION=us-east-1
AWS_BUCKET=mattarz-backups
```

## 📚 Documentação

### Módulos Principais

#### Dashboard (`/dashboard`)
- Visualização de KPIs
- Gráficos e estatísticas
- Alertas em tempo real

#### Vendas (`/sales`)
- Registro de vendas
- Comissões
- Pipeline

#### Estoque (`/products`)
- Gestão de produtos
- Controle de estoque
- Movimentação

#### Clientes (`/customers`)
- Cadastro de clientes
- Histórico de compras
- Análise de valor

#### Relatórios (`/reports`)
- Relatórios pré-configurados
- Exportação de dados
- Agendamento

#### Contas a Receber (`/receivables`)
- Parcelas pendentes
- Inadimplência
- Projeção de recebimento

#### Configurações (`/settings`)
- Perfil da empresa
- Usuários e permissões
- Integrações
- Backup e restauração

## 🔐 Segurança

### Boas Práticas
1. **Altere a senha padrão** na primeira execução
2. **Ative 2FA** para todas as contas
3. **Configure backup automático** regularmente
4. **Revise permissões de usuários** mensalmente
5. **Mantenha o sistema atualizado**

### Suporte
Para dúvidas ou problemas:
- 📧 Email: suporte@mattarzinvestimentos.com
- 💬 Chat: Disponível no app
- 📞 Telefone: +55 (11) 9999-9999

## 📝 Licença

MIT License - Veja LICENSE.md para detalhes

## 🎉 Versão

**Mattarz Investimentos v2.0 - Premium Edition**

Última atualização: Maio 2026

---

**Desenvolvido com ❤️ para o seu sucesso comercial**
