module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'bank_branch', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('users', 'ifsc', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('users', 'bank_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'bank_branch');
    await queryInterface.changeColumn('users', 'ifsc', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('users', 'bank_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};