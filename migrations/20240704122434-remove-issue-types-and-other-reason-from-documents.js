module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tbl_documents', 'issue_types');
    await queryInterface.removeColumn('tbl_documents', 'other_reason');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_documents', 'issue_types', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn('tbl_documents', 'other_reason', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
