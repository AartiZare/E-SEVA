import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';

const userBranchModel = (sequelize, DataTypes) => {
    const userBranch = sequelize.define('userBranches', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        branchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });

    return userBranch;
};

export default userBranchModel;
