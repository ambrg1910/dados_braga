const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define models
const EsteiraPropostas = sequelize.define('esteira_propostas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_unico: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique identifier (CPF + Matricula)'
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false
  },
  matricula: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  empregador: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  proposta30: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '-'
  },
  digitado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NÃO DIGITADO'
  },
  situacao: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '-'
  },
  extrator: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '-'
  },
  utilizacao: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '-'
  },
  valor_contrato: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  valor_parcela: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  prazo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  data_importacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  operador: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fonte_dados: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Source spreadsheet (PROD_PROM, ESTEIRA, etc)'
  }
}, {
  timestamps: false,
  indexes: [
    { fields: ['id_unico'] },
    { fields: ['cpf'] },
    { fields: ['matricula'] },
    { fields: ['empregador'] },
    { fields: ['logo'] },
    { fields: ['digitado'] },
    { fields: ['data_importacao'] }
  ]
});

const Validacoes = sequelize.define('validacoes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_unico: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Reference to esteira_propostas.id_unico'
  },
  tipo_validacao: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'DUPLICADO, NAO_ENCONTRADO, ERRO_DADOS, etc'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  resolvido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  data_validacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  data_resolucao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvido_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'operadores',
      key: 'id'
    }
  }
}, {
  timestamps: false,
  indexes: [
    { fields: ['id_unico'] },
    { fields: ['tipo_validacao'] },
    { fields: ['resolvido'] },
    { fields: ['data_validacao'] }
  ]
});

const Operadores = sequelize.define('operadores', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_criacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  propostas_validadas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  propostas_com_erro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: false
});

const Historico = sequelize.define('historico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  operador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'operadores',
      key: 'id'
    }
  },
  acao: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'LOGIN, LOGOUT, UPLOAD, VALIDACAO, etc'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: false,
  indexes: [
    { fields: ['operador_id'] },
    { fields: ['acao'] },
    { fields: ['data_hora'] }
  ]
});

const Empregadores = sequelize.define('empregadores', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  logo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: false
});

// Define associations
Validacoes.belongsTo(Operadores, { foreignKey: 'resolvido_por', as: 'operador' });
Historico.belongsTo(Operadores, { foreignKey: 'operador_id', as: 'operador' });

// Export models
module.exports = {
  sequelize,
  EsteiraPropostas,
  Validacoes,
  Operadores,
  Historico,
  Empregadores
};