'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert sample proposals
    const proposals = [];
    const employers = ['Empresa A', 'Empresa B', 'Empresa C'];
    const logos = ['Logo 1', 'Logo 2', 'Logo 3'];
    const situations = ['Aprovada', 'Pendente', 'Rejeitada'];
    const extractors = ['Extrator 1', 'Extrator 2', 'Extrator 3'];
    const utilizations = ['Utilização 1', 'Utilização 2', 'Utilização 3'];
    
    // Generate 50 sample proposals
    for (let i = 1; i <= 50; i++) {
      const digitado = Math.random() > 0.3; // 70% are digitized
      proposals.push({
        cpf: `${100000000 + i}`.padStart(11, '0'),
        matricula: `MAT${1000 + i}`,
        nome: `Cliente ${i}`,
        empregador: employers[Math.floor(Math.random() * employers.length)],
        logo: logos[Math.floor(Math.random() * logos.length)],
        situacao: situations[Math.floor(Math.random() * situations.length)],
        extrator: extractors[Math.floor(Math.random() * extractors.length)],
        utilizacao: utilizations[Math.floor(Math.random() * utilizations.length)],
        digitado: digitado,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }
    
    await queryInterface.bulkInsert('esteira_propostas', proposals);
    
    // Insert sample validations
    const validationTypes = ['CPF_INVALIDO', 'MATRICULA_DUPLICADA', 'NOME_INCOMPLETO', 'EMPREGADOR_NAO_ENCONTRADO'];
    const validations = [];
    
    // Generate validation issues for some proposals
    for (let i = 1; i <= 20; i++) {
      const propostaId = Math.floor(Math.random() * 50) + 1;
      const resolvido = Math.random() > 0.6; // 40% are resolved
      validations.push({
        tipo: validationTypes[Math.floor(Math.random() * validationTypes.length)],
        mensagem: `Problema encontrado na proposta #${propostaId}`,
        propostaId: propostaId,
        dadosOriginais: JSON.stringify({ campo: 'valor_original' }),
        resolvido: resolvido,
        resolvidoEm: resolvido ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000) : null,
        resolvidoPorId: resolvido ? 1 : null, // Admin user resolves some issues
        observacao: resolvido ? 'Problema resolvido após verificação' : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }
    
    await queryInterface.bulkInsert('validacoes', validations);
    
    // Insert sample history records
    const actions = ['CRIAR', 'ATUALIZAR', 'RESOLVER', 'UPLOAD'];
    const tables = ['esteira_propostas', 'validacoes', 'operadores'];
    const history = [];
    
    // Generate history records
    for (let i = 1; i <= 30; i++) {
      const table = tables[Math.floor(Math.random() * tables.length)];
      const registroId = Math.floor(Math.random() * 50) + 1;
      history.push({
        operadorId: 1, // Admin user
        acao: actions[Math.floor(Math.random() * actions.length)],
        tabela: table,
        registroId: registroId,
        detalhes: JSON.stringify({ campo: 'valor_antigo', novo_valor: 'valor_novo' }),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }
    
    return queryInterface.bulkInsert('historico', history);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('historico', null, {});
    await queryInterface.bulkDelete('validacoes', null, {});
    await queryInterface.bulkDelete('esteira_propostas', null, {});
  }
};