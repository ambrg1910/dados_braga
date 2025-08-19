# Database Schema

## Tables

### operadores

Stores information about system users (operators and administrators).

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| nome | STRING | Full name of the operator |
| username | STRING | Unique username for login |
| senha | STRING | Hashed password |
| email | STRING | Email address (unique) |
| admin | BOOLEAN | Administrator flag (default: false) |
| ativo | BOOLEAN | Active status flag (default: true) |
| ultimoLogin | DATE | Timestamp of last login |
| createdAt | DATE | Record creation timestamp |
| updatedAt | DATE | Record update timestamp |

### esteira_propostas

Stores information about card proposals in the processing pipeline.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| cpf | STRING | Customer CPF (Brazilian ID) |
| matricula | STRING | Customer registration number |
| nome | STRING | Customer name |
| empregador | STRING | Employer name |
| logo | STRING | Logo/brand identifier |
| situacao | STRING | Current status of the proposal |
| extrator | STRING | Extractor identifier |
| utilizacao | STRING | Usage type |
| digitado | BOOLEAN | Whether the proposal has been digitized (default: false) |
| createdAt | DATE | Record creation timestamp |
| updatedAt | DATE | Record update timestamp |

### validacoes

Stores validation issues identified in proposals.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| tipo | STRING | Type of validation issue |
| mensagem | STRING | Description of the issue |
| propostaId | INTEGER | Foreign key to esteira_propostas.id |
| dadosOriginais | TEXT | Original data in JSON format |
| resolvido | BOOLEAN | Whether the issue has been resolved (default: false) |
| resolvidoEm | DATE | Timestamp when the issue was resolved |
| resolvidoPorId | INTEGER | Foreign key to operadores.id (who resolved the issue) |
| observacao | TEXT | Notes about the resolution |
| createdAt | DATE | Record creation timestamp |
| updatedAt | DATE | Record update timestamp |

### historico

Stores audit trail of actions performed in the system.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| operadorId | INTEGER | Foreign key to operadores.id (who performed the action) |
| acao | STRING | Type of action performed |
| tabela | STRING | Table affected by the action |
| registroId | INTEGER | ID of the affected record |
| detalhes | TEXT | Details of the action in JSON format |
| createdAt | DATE | Record creation timestamp |
| updatedAt | DATE | Record update timestamp |

## Relationships

### operadores → validacoes

- One-to-many relationship
- An operator can resolve multiple validation issues
- Foreign key: validacoes.resolvidoPorId → operadores.id

### operadores → historico

- One-to-many relationship
- An operator can perform multiple actions recorded in the history
- Foreign key: historico.operadorId → operadores.id

### esteira_propostas → validacoes

- One-to-many relationship
- A proposal can have multiple validation issues
- Foreign key: validacoes.propostaId → esteira_propostas.id

## Indexes

### operadores

- Primary key: id
- Unique indexes: username, email

### esteira_propostas

- Primary key: id
- Indexes: cpf, matricula, empregador, logo, digitado

### validacoes

- Primary key: id
- Indexes: tipo, propostaId, resolvido, resolvidoPorId

### historico

- Primary key: id
- Indexes: operadorId, tabela, registroId, createdAt

## Data Types

### Validation Types

Common validation issue types include:

- CPF_INVALIDO: Invalid CPF format or checksum
- MATRICULA_DUPLICADA: Duplicate registration number
- NOME_INCOMPLETO: Incomplete customer name
- EMPREGADOR_NAO_ENCONTRADO: Employer not found in reference data

### Action Types

Common action types recorded in the history:

- CRIAR: Create a new record
- ATUALIZAR: Update an existing record
- RESOLVER: Resolve a validation issue
- UPLOAD: Upload a spreadsheet