'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('esteira_propostas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cpf: {
        type: Sequelize.STRING,
        allowNull: true
      },
      matricula: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: true
      },
      empregador: {
        type: Sequelize.STRING,
        allowNull: true
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      situacao: {
        type: Sequelize.STRING,
        allowNull: true
      },
      extrator: {
        type: Sequelize.STRING,
        allowNull: true
      },
      utilizacao: {
        type: Sequelize.STRING,
        allowNull: true
      },
      digitado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.addIndex('esteira_propostas', ['cpf']);
    await queryInterface.addIndex('esteira_propostas', ['matricula']);
    await queryInterface.addIndex('esteira_propostas', ['empregador']);
    await queryInterface.addIndex('esteira_propostas', ['logo']);
    await queryInterface.addIndex('esteira_propostas', ['digitado']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('esteira_propostas');
  }
};