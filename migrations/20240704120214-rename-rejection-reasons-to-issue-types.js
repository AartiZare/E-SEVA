module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('tbl_rejection_reasons', 'tb_issue_types');

    await queryInterface.changeColumn('tb_issue_types', 'issue_types', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // If you want to rename the model or update references, you can do it here.
    // For example, you might need to update references in other models or scripts.
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('tb_issue_types', 'tbl_rejection_reasons');

    await queryInterface.changeColumn('tbl_rejection_reasons', 'issue_types', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Revert any other changes made in the 'up' method.
  },
};
