'use strict';

module.exports = (sequelize, DataTypes) => {
  const Historico = sequelize.define('Historico', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    operadorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'operadores',
        key: 'id'
      }
    },
    acao: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tabela: {
      type: DataTypes.STRING,
      allowNull: false
    },
    registroId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detalhes: {
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
    tableName: 'historico'
  });

  Historico.associate = function(models) {
    Historico.belongsTo(models.Operadores, {
      foreignKey: 'operadorId',
      as: 'operador'
    });
  };

  return Historico;
};