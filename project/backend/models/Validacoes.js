'use strict';

module.exports = (sequelize, DataTypes) => {
  const Validacoes = sequelize.define('Validacoes', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mensagem: {
      type: DataTypes.STRING,
      allowNull: false
    },
    propostaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'esteira_propostas',
        key: 'id'
      }
    },
    dadosOriginais: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resolvido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolvidoEm: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolvidoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'operadores',
        key: 'id'
      }
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'validacoes'
  });

  Validacoes.associate = function(models) {
    Validacoes.belongsTo(models.EsteiraPropostas, {
      foreignKey: 'propostaId',
      as: 'proposta'
    });
    
    Validacoes.belongsTo(models.Operadores, {
      foreignKey: 'resolvidoPorId',
      as: 'resolvidoPor'
    });
  };

  return Validacoes;
};