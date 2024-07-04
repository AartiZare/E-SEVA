module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('document_rejections', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_documents',
          key: 'id',
        },
      },
      rejected_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_users',
          key: 'id',
        },
      },
      issue_types: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      other_reasons: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tbl_document_rejections_details');
  },
};
