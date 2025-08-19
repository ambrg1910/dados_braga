# ETL Process Documentation

## Overview

The ETL (Extract, Transform, Load) process is responsible for importing data from various spreadsheet formats into the system's database. The process handles different types of spreadsheets, normalizes data, validates entries, and creates validation issues when discrepancies are found.

## Supported Spreadsheet Types

1. **PROD_PROM**: Production and promotion data
2. **ESTEIRA**: Pipeline data
3. **OP_REALIZADAS**: Completed operations
4. **SEGUROS**: Insurance data

## Process Flow

### 1. Extract

- User uploads a spreadsheet file (Excel or CSV)
- System validates file format and size
- File is temporarily stored on the server
- File is parsed using appropriate library (csv-parser for CSV, xlsx for Excel)

### 2. Transform

- Headers are normalized (case-insensitive, spaces removed)
- Required fields are validated based on spreadsheet type
- Data is cleaned and formatted (e.g., CPF formatting, string trimming)
- Data is mapped to the database schema

### 3. Load

- Records are created or updated in the database
- Validation issues are identified and recorded
- Upload action is logged in the history

## Field Mapping

### PROD_PROM Spreadsheet

| Spreadsheet Column | Database Field | Notes |
|-------------------|----------------|-------|
| CPF | cpf | Normalized to remove special characters |
| MATRICULA | matricula | - |
| NOME | nome | - |
| EMPREGADOR | empregador | - |
| LOGO | logo | - |
| SITUACAO | situacao | - |
| EXTRATOR | extrator | - |
| UTILIZACAO | utilizacao | - |

### ESTEIRA Spreadsheet

| Spreadsheet Column | Database Field | Notes |
|-------------------|----------------|-------|
| CPF | cpf | Normalized to remove special characters |
| MATRICULA | matricula | - |
| NOME_CLIENTE | nome | - |
| EMPREGADOR | empregador | - |
| LOGO | logo | - |
| STATUS | situacao | Mapped from status to situacao |
| EXTRATOR | extrator | - |
| UTILIZACAO | utilizacao | - |

### OP_REALIZADAS Spreadsheet

| Spreadsheet Column | Database Field | Notes |
|-------------------|----------------|-------|
| CPF_CLIENTE | cpf | Normalized to remove special characters |
| MATRICULA | matricula | - |
| NOME | nome | - |
| EMPREGADOR | empregador | - |
| LOGO | logo | - |
| SITUACAO | situacao | - |
| EXTRATOR | extrator | Default value if missing |
| UTILIZACAO | utilizacao | Default value if missing |

### SEGUROS Spreadsheet

| Spreadsheet Column | Database Field | Notes |
|-------------------|----------------|-------|
| CPF | cpf | Normalized to remove special characters |
| MATRICULA | matricula | - |
| NOME_SEGURADO | nome | Mapped from nome_segurado to nome |
| EMPRESA | empregador | Mapped from empresa to empregador |
| LOGO | logo | - |
| STATUS_ATUAL | situacao | Mapped from status_atual to situacao |
| EXTRATOR | extrator | Default value if missing |
| UTILIZACAO | utilizacao | Default value if missing |

## Validation Process

### Data Validation

The system performs the following validations during the ETL process:

1. **Required Fields**: Checks if all required fields are present in the spreadsheet
2. **CPF Format**: Validates CPF format and checksum
3. **Duplicate Check**: Identifies duplicate entries based on CPF and matricula
4. **Reference Data**: Validates against reference data (e.g., valid employers)

### Validation Issues

When validation issues are found, they are recorded in the `validacoes` table with the following information:

- **tipo**: Type of validation issue (e.g., CPF_INVALIDO, MATRICULA_DUPLICADA)
- **mensagem**: Description of the issue
- **propostaId**: Reference to the affected proposal (if applicable)
- **dadosOriginais**: Original data from the spreadsheet in JSON format

## Error Handling

### File Format Errors

- Invalid file extensions are rejected
- Files exceeding size limits are rejected
- Malformed CSV or Excel files trigger appropriate error messages

### Data Errors

- Missing required columns trigger an error response
- Data type mismatches are recorded as validation issues
- Duplicate entries are identified and flagged

## Performance Considerations

- Large files are processed in chunks to avoid memory issues
- Database operations use bulk inserts where possible
- Indexes are utilized for efficient lookups during validation

## Logging and Auditing

All ETL operations are logged in the `historico` table with the following information:

- **operadorId**: User who performed the upload
- **acao**: "UPLOAD"
- **tabela**: Table affected by the upload
- **detalhes**: Details including filename, spreadsheet type, and processing statistics