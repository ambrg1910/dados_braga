# API Documentation

## Authentication

### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "nome": "string",
    "username": "string",
    "email": "string",
    "admin": "boolean",
    "ativo": "boolean"
  }
}
```

### Get Current User

```
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "number",
  "nome": "string",
  "username": "string",
  "email": "string",
  "admin": "boolean",
  "ativo": "boolean"
}
```

## Uploads

### Upload Spreadsheet

```
POST /api/uploads/spreadsheet
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
```
file: File (Excel or CSV)
type: "PROD_PROM" | "ESTEIRA" | "OP_REALIZADAS" | "SEGUROS"
```

**Response:**
```json
{
  "success": true,
  "message": "Arquivo processado com sucesso",
  "data": {
    "filename": "string",
    "processedCount": "number",
    "validationIssues": "number"
  }
}
```

### Validate Spreadsheet

```
POST /api/uploads/validate
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
```
file: File (Excel or CSV)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "string",
    "validatedCount": "number",
    "notFoundCount": "number",
    "details": [
      {
        "cpf": "string",
        "matricula": "string",
        "found": "boolean"
      }
    ]
  }
}
```

### Download File

```
GET /api/uploads/:filename
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** File download

## Proposals

### Get All Proposals

```
GET /api/proposals
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10)
search: string
empregador: string
logo: string
digitado: boolean
startDate: string (YYYY-MM-DD)
endDate: string (YYYY-MM-DD)
```

**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "cpf": "string",
      "matricula": "string",
      "nome": "string",
      "empregador": "string",
      "logo": "string",
      "situacao": "string",
      "extrator": "string",
      "utilizacao": "string",
      "digitado": "boolean",
      "createdAt": "string",
      "updatedAt": "string",
      "validacoes": [
        {
          "id": "number",
          "tipo": "string",
          "mensagem": "string",
          "resolvido": "boolean"
        }
      ]
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "pages": "number"
  },
  "summary": {
    "total": "number",
    "digitado": "number",
    "naoDigitado": "number",
    "validacoesPendentes": "number"
  }
}
```

### Get Proposal by ID

```
GET /api/proposals/:id
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "number",
  "cpf": "string",
  "matricula": "string",
  "nome": "string",
  "empregador": "string",
  "logo": "string",
  "situacao": "string",
  "extrator": "string",
  "utilizacao": "string",
  "digitado": "boolean",
  "createdAt": "string",
  "updatedAt": "string",
  "validacoes": [
    {
      "id": "number",
      "tipo": "string",
      "mensagem": "string",
      "resolvido": "boolean",
      "resolvidoEm": "string",
      "resolvidoPor": {
        "id": "number",
        "nome": "string"
      },
      "observacao": "string"
    }
  ]
}
```

### Update Proposal

```
PUT /api/proposals/:id
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "situacao": "string",
  "extrator": "string",
  "utilizacao": "string",
  "digitado": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proposta atualizada com sucesso",
  "data": {
    "id": "number",
    "cpf": "string",
    "matricula": "string",
    "nome": "string",
    "empregador": "string",
    "logo": "string",
    "situacao": "string",
    "extrator": "string",
    "utilizacao": "string",
    "digitado": "boolean",
    "updatedAt": "string"
  }
}
```

### Delete Proposal

```
DELETE /api/proposals/:id
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Proposta excluída com sucesso"
}
```

### Get Proposal Summary Stats

```
GET /api/proposals/summary/stats
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total": "number",
  "digitado": "number",
  "naoDigitado": "number",
  "porEmpregador": [
    {
      "empregador": "string",
      "count": "number"
    }
  ],
  "porLogo": [
    {
      "logo": "string",
      "count": "number"
    }
  ]
}
```

## Validations

### Get All Validations

```
GET /api/validations
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10)
search: string
tipo: string
resolvido: boolean
```

**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "tipo": "string",
      "mensagem": "string",
      "propostaId": "number",
      "dadosOriginais": "object",
      "resolvido": "boolean",
      "resolvidoEm": "string",
      "resolvidoPorId": "number",
      "observacao": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "proposta": {
        "id": "number",
        "cpf": "string",
        "matricula": "string",
        "nome": "string",
        "empregador": "string",
        "logo": "string"
      },
      "resolvidoPor": {
        "id": "number",
        "nome": "string"
      }
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "pages": "number"
  },
  "summary": {
    "total": "number",
    "resolvido": "number",
    "pendente": "number",
    "tipoMaisComum": "string"
  }
}
```

### Get Validation by ID

```
GET /api/validations/:id
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "number",
  "tipo": "string",
  "mensagem": "string",
  "propostaId": "number",
  "dadosOriginais": "object",
  "resolvido": "boolean",
  "resolvidoEm": "string",
  "resolvidoPorId": "number",
  "observacao": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "proposta": {
    "id": "number",
    "cpf": "string",
    "matricula": "string",
    "nome": "string",
    "empregador": "string",
    "logo": "string",
    "situacao": "string",
    "extrator": "string",
    "utilizacao": "string",
    "digitado": "boolean"
  },
  "resolvidoPor": {
    "id": "number",
    "nome": "string"
  }
}
```

### Resolve Validation

```
PUT /api/validations/:id/resolve
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "observacao": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Validação resolvida com sucesso",
  "data": {
    "id": "number",
    "resolvido": true,
    "resolvidoEm": "string",
    "resolvidoPorId": "number",
    "observacao": "string",
    "updatedAt": "string"
  }
}
```

### Get Validation Summary Stats

```
GET /api/validations/summary/stats
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total": "number",
  "resolvido": "number",
  "pendente": "number",
  "porTipo": [
    {
      "tipo": "string",
      "count": "number"
    }
  ]
}
```

## Dashboard

### Get Summary

```
GET /api/dashboard/summary
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "propostas": {
    "total": "number",
    "digitado": "number",
    "naoDigitado": "number",
    "porSituacao": [
      {
        "situacao": "string",
        "count": "number"
      }
    ],
    "porEmpregador": [
      {
        "empregador": "string",
        "count": "number"
      }
    ],
    "porLogo": [
      {
        "logo": "string",
        "count": "number"
      }
    ]
  },
  "validacoes": {
    "total": "number",
    "resolvido": "number",
    "pendente": "number",
    "porTipo": [
      {
        "tipo": "string",
        "count": "number"
      }
    ]
  }
}
```

### Get Daily Stats

```
GET /api/dashboard/daily-stats
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
days: number (default: 7)
```

**Response:**
```json
{
  "dates": ["string"],
  "novasPropostas": ["number"],
  "novasValidacoes": ["number"],
  "validacoesResolvidas": ["number"]
}
```

### Get Operator Performance

```
GET /api/dashboard/operator-performance
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "number",
    "nome": "string",
    "acoesCount": "number",
    "validacoesResolvidasCount": "number",
    "tempoMedioResolucao": "number",
    "ultimaAcao": "string"
  }
]
```

### Get Recent Uploads

```
GET /api/dashboard/recent-uploads
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "number",
    "operador": {
      "id": "number",
      "nome": "string"
    },
    "acao": "string",
    "tabela": "string",
    "detalhes": "object",
    "createdAt": "string"
  }
]
```

## Operators

### Get All Operators

```
GET /api/operators
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10)
search: string
```

**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "nome": "string",
      "username": "string",
      "email": "string",
      "admin": "boolean",
      "ativo": "boolean",
      "ultimoLogin": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "performance": {
        "acoesCount": "number",
        "validacoesResolvidasCount": "number",
        "ultimaAcao": "string",
        "score": "number"
      }
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "pages": "number"
  }
}
```

### Get Operator by ID

```
GET /api/operators/:id
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "number",
  "nome": "string",
  "username": "string",
  "email": "string",
  "admin": "boolean",
  "ativo": "boolean",
  "ultimoLogin": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "performance": {
    "acoesCount": "number",
    "validacoesResolvidasCount": "number",
    "ultimaAcao": "string",
    "score": "number"
  }
}
```

### Create Operator

```
POST /api/operators
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "string",
  "username": "string",
  "email": "string",
  "senha": "string",
  "admin": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Operador criado com sucesso",
  "data": {
    "id": "number",
    "nome": "string",
    "username": "string",
    "email": "string",
    "admin": "boolean",
    "ativo": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Update Operator

```
PUT /api/operators/:id
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "string",
  "email": "string",
  "admin": "boolean",
  "ativo": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Operador atualizado com sucesso",
  "data": {
    "id": "number",
    "nome": "string",
    "email": "string",
    "admin": "boolean",
    "ativo": "boolean",
    "updatedAt": "string"
  }
}
```

### Reset Operator Password

```
PUT /api/operators/:id/reset-password
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "senha": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Senha redefinida com sucesso"
}
```

### Update Own Profile

```
PUT /api/operators/profile/update
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "data": {
    "id": "number",
    "nome": "string",
    "email": "string",
    "updatedAt": "string"
  }
}
```

### Change Own Password

```
PUT /api/operators/profile/change-password
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "senhaAtual": "string",
  "novaSenha": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

## Reports

### Generate Report

```
POST /api/reports/generate
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "formato": "excel" | "pdf",
  "filtros": {
    "startDate": "string",
    "endDate": "string",
    "empregador": "string",
    "logo": "string",
    "operadorId": "number",
    "digitado": "boolean"
  }
}
```

**Response:** File download (Excel or PDF)