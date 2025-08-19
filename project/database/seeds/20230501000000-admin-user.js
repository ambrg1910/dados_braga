'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    return queryInterface.bulkInsert('operadores', [{
      nome: 'Administrador',
      username: 'admin',
      senha: hashedPassword,
      email: 'admin@sistema.com',
      admin: true,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('operadores', { username: 'admin' }, {});
  }
};