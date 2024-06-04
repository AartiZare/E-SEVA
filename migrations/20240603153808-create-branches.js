'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('branches', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            branch_code: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            pincode: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            stateId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'states', // name of the States table
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            divisionId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'divisions', // name of the Divisions table
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            districtId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'districts', // name of the Districts table
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            talukId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'taluks', // name of the Taluks table
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            createdBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users', // name of the Users table
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('now')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('now')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('branches');
    }
};
