'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('validacoes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mensagem: {
        type: Sequelize.STRING,
        allowNull: false
      },
      propostaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'esteira_propostas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      dadosOriginais: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resolvido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      resolvidoEm: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolvidoPorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'operadores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      observacao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Add indexes for better performance
    await queryInterface.addIndex('validacoes', ['tipo']);
    await queryInterface.addIndex('validacoes', ['propostaId']);
    await queryInterface.addIndex('validacoes', ['resolvido']);
    await queryInterface.addIndex('validacoes', ['resolvidoPorId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('validacoes');
  }
};