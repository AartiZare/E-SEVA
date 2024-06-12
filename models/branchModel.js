import userBranchModel from './userBranchModel.js';

const branchModel = (sequelize, DataTypes) => {
    const Branch = sequelize.define("branches", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        branch_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        talukId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'taluks', // name of the Taluks table
                key: 'id',
            },
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users', // name of the Users table
                key: 'id',
            },
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    }, {
        timestamps: true
    });

    return Branch;
};

export default branchModel;