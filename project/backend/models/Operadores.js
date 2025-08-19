'use strict';

module.exports = (sequelize, DataTypes) => {
  const Operadores = sequelize.define('Operadores', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
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
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ultimoLogin: {
      type: DataTypes.DATE,
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
    tableName: 'operadores'
  });

  Operadores.associate = function(models) {
    Operadores.hasMany(models.Validacoes, {
      foreignKey: 'resolvidoPorId',
      as: 'validacoesResolvidas'
    });
    
    Operadores.hasMany(models.Historico, {
      foreignKey: 'operadorId',
      as: 'historicos'
    });
  };

  return Operadores;
};