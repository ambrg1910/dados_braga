'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('historico', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      operadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'operadores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      acao: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tabela: {
        type: Sequelize.STRING,
        allowNull: false
      },
      registroId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      detalhes: {
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
    await queryInterface.addIndex('historico', ['operadorId']);
    await queryInterface.addIndex('historico', ['tabela']);
    await queryInterface.addIndex('historico', ['registroId']);
    await queryInterface.addIndex('historico', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('historico');
  }
};