'use strict';

module.exports = (sequelize, DataTypes) => {
  const EsteiraPropostas = sequelize.define('EsteiraPropostas', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true
    },
    matricula: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: true
    },
    empregador: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    situacao: {
      type: DataTypes.STRING,
      allowNull: true
    },
    extrator: {
      type: DataTypes.STRING,
      allowNull: true
    },
    utilizacao: {
      type: DataTypes.STRING,
      allowNull: true
    },
    digitado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: 'esteira_propostas'
  });

  EsteiraPropostas.associate = function(models) {
    EsteiraPropostas.hasMany(models.Validacoes, {
      foreignKey: 'propostaId',
      as: 'validacoes'
    });
  };

  return EsteiraPropostas;
};