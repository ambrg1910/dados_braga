-- Initial database schema for Card Operations Insights & Validation System

-- Create tables

-- Table: esteira_propostas (consolidated proposals)
CREATE TABLE IF NOT EXISTS esteira_propostas (
    id SERIAL PRIMARY KEY,
    id_unico VARCHAR(255) NOT NULL UNIQUE,  -- CPF + Matricula
    cpf VARCHAR(14),
    matricula VARCHAR(50),
    nome VARCHAR(255),
    proposta30 VARCHAR(50) DEFAULT '-',
    digitado VARCHAR(20) DEFAULT 'NÃO DIGITADO',
    situacao VARCHAR(50) DEFAULT '-',
    extrator VARCHAR(50) DEFAULT '-',
    utilizacao VARCHAR(50) DEFAULT '-',
    empregador VARCHAR(255) DEFAULT '-',
    logo INTEGER DEFAULT 3,
    data_proposta DATE DEFAULT '1900-01-01',
    valor_proposta NUMERIC(15, 2) DEFAULT 0,
    prazo INTEGER DEFAULT 0,
    taxa NUMERIC(10, 2) DEFAULT 0,
    operador VARCHAR(100) DEFAULT '-',
    origem_dados VARCHAR(100),  -- Which spreadsheet this came from
    data_importacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_id_unico UNIQUE (id_unico)
);

-- Table: validacoes (validation results)
CREATE TABLE IF NOT EXISTS validacoes (
    id SERIAL PRIMARY KEY,
    id_unico VARCHAR(255) NOT NULL,
    tipo_validacao VARCHAR(50) NOT NULL,  -- 'DUPLICADO', 'ERRO', 'ORFAO', etc.
    descricao TEXT,
    resolvido BOOLEAN DEFAULT FALSE,
    data_validacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resolucao TIMESTAMP,
    resolvido_por VARCHAR(100),
    CONSTRAINT fk_validacoes_proposta FOREIGN KEY (id_unico) REFERENCES esteira_propostas(id_unico) ON DELETE CASCADE
);

-- Table: operadores (operator info and performance)
CREATE TABLE IF NOT EXISTS operadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,  -- Hashed password
    email VARCHAR(255),
    perfil VARCHAR(20) DEFAULT 'OPERADOR',  -- 'ADMIN' or 'OPERADOR'
    ativo BOOLEAN DEFAULT TRUE,
    propostas_validadas INTEGER DEFAULT 0,
    propostas_com_erro INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,  -- For gamification
    ultimo_login TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: historico (audit logs)
CREATE TABLE IF NOT EXISTS historico (
    id SERIAL PRIMARY KEY,
    operador_id INTEGER,
    acao VARCHAR(50) NOT NULL,  -- 'LOGIN', 'LOGOUT', 'UPLOAD', 'VALIDACAO', etc.
    descricao TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    CONSTRAINT fk_historico_operador FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE SET NULL
);

-- Table: empregadores (employer -> logo mapping)
CREATE TABLE IF NOT EXISTS empregadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    logo INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_esteira_propostas_id_unico ON esteira_propostas(id_unico);
CREATE INDEX idx_esteira_propostas_cpf ON esteira_propostas(cpf);
CREATE INDEX idx_esteira_propostas_matricula ON esteira_propostas(matricula);
CREATE INDEX idx_esteira_propostas_empregador ON esteira_propostas(empregador);
CREATE INDEX idx_esteira_propostas_logo ON esteira_propostas(logo);
CREATE INDEX idx_esteira_propostas_data_proposta ON esteira_propostas(data_proposta);
CREATE INDEX idx_validacoes_id_unico ON validacoes(id_unico);
CREATE INDEX idx_validacoes_tipo_validacao ON validacoes(tipo_validacao);
CREATE INDEX idx_historico_operador_id ON historico(operador_id);
CREATE INDEX idx_historico_acao ON historico(acao);

-- Insert default admin user
INSERT INTO operadores (nome, usuario, senha, email, perfil)
VALUES ('Admin', 'admin', '$2a$10$JQOfIzIlsLLbCdDj7Lms7uV3KC0P3FIbQrWQtRFJHzkazfIpOSjqa', 'admin@example.com', 'ADMIN')
ON CONFLICT (usuario) DO NOTHING;

-- Insert default employer -> logo mappings
INSERT INTO empregadores (nome, logo) VALUES 
('GOV GOIAS SEG', 31),
('INSS BENEF SEG', 61),
('INSS RMC SEG', 71),
('DEFAULT_1', 3),
('DEFAULT_2', 6),
('DEFAULT_3', 7)
ON CONFLICT (nome) DO NOTHING;