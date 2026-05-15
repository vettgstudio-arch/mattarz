# Como Resolver Erros de Banco de Dados

## SQLite (Banco de Dados Local)

O sistema utiliza **SQLite**, um banco de dados que funciona como arquivo local. Não é necessário instalar nenhum servidor de banco de dados.

### O banco é criado automaticamente

Ao iniciar o servidor pela primeira vez, o arquivo `mattarz.db` será criado na raiz do projeto com todas as tabelas necessárias.

### Se houver algum problema:

1. **Pare o servidor** (feche o terminal ou pressione Ctrl+C)
2. **Delete o arquivo** `mattarz.db` na pasta do projeto
3. **Inicie o servidor novamente** com `start.bat` ou `pnpm dev`
4. O banco será recriado automaticamente

### Categorias

As categorias são fixas no sistema:
- Celular
- Fone
- Carregador
- Notebook
- Outros
