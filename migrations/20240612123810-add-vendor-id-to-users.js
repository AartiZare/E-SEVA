'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'vendor_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'vendors', // name of the Vendors table
                key: 'id',
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'vendor_id');
    }
};
